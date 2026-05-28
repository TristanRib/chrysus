"use client";

import { useEffect, useState } from "react";
import { API_BASE, UP_COLOR, DOWN_COLOR } from "../lib/constants";
import TooltipIcon from "../components/TooltipIcon";

type IndicatorKey = "gdp_growth" | "cpi" | "unemployment" | "debt_gdp" | "current_account";

type IndicatorMeta = {
  label: string;
  signed: boolean;
  tooltip: string;
  colorFn: (v: number) => string;
};

const AMBER = "#f5c842";

const INDICATORS: Record<IndicatorKey, IndicatorMeta> = {
  gdp_growth: {
    label: "Croissance PIB", signed: true,
    tooltip: "Mesure la croissance de l'économie réelle. Une forte croissance soutient les marchés actions et renforce la devise nationale.",
    colorFn: v => v >= 1 ? UP_COLOR : v >= 0 ? AMBER : DOWN_COLOR,
  },
  cpi: {
    label: "Inflation", signed: false,
    tooltip: "Les banques centrales ciblent ~2%. Au-delà, elles remontent les taux — ce qui impacte obligations, forex et marchés actions.",
    colorFn: v => v <= 2 ? UP_COLOR : v <= 5 ? AMBER : DOWN_COLOR,
  },
  unemployment: {
    label: "Chômage", signed: false,
    tooltip: "Un faible chômage indique une économie saine mais peut signaler une surchauffe. Suivi de près par la Fed et la BCE pour calibrer leur politique monétaire.",
    colorFn: v => v <= 5 ? UP_COLOR : v <= 8 ? AMBER : DOWN_COLOR,
  },
  debt_gdp: {
    label: "Dette / PIB", signed: false,
    tooltip: "Soutenabilité des finances publiques. Une dette > 100% du PIB augmente le risque souverain et peut fragiliser la devise sur le long terme.",
    colorFn: v => v <= 60 ? UP_COLOR : v <= 100 ? AMBER : DOWN_COLOR,
  },
  current_account: {
    label: "Solde courant", signed: true,
    tooltip: "Excédent = pays exportateur net, renforce la devise. Déficit = dépendance aux capitaux étrangers et vulnérabilité aux chocs de marché.",
    colorFn: v => v >= 0 ? UP_COLOR : DOWN_COLOR,
  },
};

const INDICATOR_ORDER: IndicatorKey[] = [
  "gdp_growth", "cpi", "unemployment", "debt_gdp", "current_account",
];

type IndicatorValue = { value: number; year: string } | null;
type Country = {
  code: string;
  name: string;
  flag: string;
  continent: string;
  indicators: Record<IndicatorKey, IndicatorValue>;
};

const CONTINENT_ORDER = ["Amériques", "Asie-Pacifique", "Europe"];

function fmt(key: IndicatorKey, value: number): string {
  const prefix = INDICATORS[key].signed && value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

export default function MacroPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/nations`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setCountries(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return (
    <main style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Nations</h1>
        <p style={{ color: "#555", fontSize: "0.8rem", marginTop: "0.25rem" }}>
          Indicateurs économiques · données annuelles FMI
        </p>
      </div>

      {error && (
        <p style={{ color: "#555", fontSize: "0.875rem" }}>
          Impossible de charger les données. L'API est-elle démarrée ?
        </p>
      )}

      {loading ? <MacroSkeleton /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {CONTINENT_ORDER.map(continent => {
            const group = countries.filter(c => c.continent === continent);
            if (!group.length) return null;
            return (
              <section key={continent}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666" }}>
                    {continent}
                  </span>
                </div>
                <div style={{ border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden", overflowX: "auto" }}>
                  <table className="macro-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left" }}>Pays</th>
                        {INDICATOR_ORDER.map(key => (
                          <th key={key}>
                            {INDICATORS[key].label}
                            <TooltipIcon text={INDICATORS[key].tooltip} />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {group.map((country, i) => (
                        <tr key={country.code} style={{ borderTop: i === 0 ? "none" : "1px solid #141414" }}>
                          <td>
                            <div className="macro-table__country">
                              <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{country.flag}</span>
                              <span>{country.name}</span>
                            </div>
                          </td>
                          {INDICATOR_ORDER.map(key => {
                            const ind = country.indicators[key];
                            return (
                              <td key={key} className="macro-table__value">
                                {ind ? (
                                  <>
                                    <span style={{ color: INDICATORS[key].colorFn(ind.value) }}>
                                      {fmt(key, ind.value)}
                                    </span>
                                    <span className="macro-table__year">{ind.year}</span>
                                  </>
                                ) : (
                                  <span style={{ color: "#2e2e2e" }}>—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {!loading && !error && (
        <p style={{ color: "#2e2e2e", fontSize: "0.72rem", marginTop: "1rem" }}>
          Vert = favorable · Ambre = neutre · Rouge = défavorable · Données : FMI
        </p>
      )}
    </main>
  );
}

function SkeletonTable({ rows }: { rows: number }) {
  return (
    <div style={{ border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
      <table className="macro-table">
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Pays</th>
            {INDICATOR_ORDER.map(key => <th key={key}>{INDICATORS[key].label}</th>)}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} style={{ borderTop: i === 0 ? "none" : "1px solid #141414" }}>
              <td>
                <div className="macro-table__country">
                  <div style={{ width: 22, height: 22, background: "#1a1a1a", borderRadius: 4 }} />
                  <div style={{ width: 90, height: 11, background: "#1a1a1a", borderRadius: 3 }} />
                </div>
              </td>
              {INDICATOR_ORDER.map(key => (
                <td key={key} className="macro-table__value">
                  <div style={{ width: 44, height: 11, background: "#1a1a1a", borderRadius: 3, margin: "0 auto" }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MacroSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {[["Amériques", 3], ["Asie-Pacifique", 4], ["Europe", 5]].map(([label, rows]) => (
        <section key={label}>
          <div style={{ width: 80, height: 11, background: "#1a1a1a", borderRadius: 3, marginBottom: "0.75rem" }} />
          <SkeletonTable rows={rows as number} />
        </section>
      ))}
    </div>
  );
}
