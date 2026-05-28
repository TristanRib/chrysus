"use client";

import { useEffect, useState } from "react";
import { API_BASE, UP_COLOR, DOWN_COLOR } from "../lib/constants";

type IndicatorKey = "gdp_growth" | "cpi" | "unemployment" | "debt_gdp" | "current_account";

type IndicatorMeta = {
  label: string;
  signed: boolean;
  colorFn: (v: number) => string;
};

const AMBER = "#f5c842";

const INDICATORS: Record<IndicatorKey, IndicatorMeta> = {
  gdp_growth:      { label: "Croissance PIB", signed: true,  colorFn: v => v >= 1 ? UP_COLOR : v >= 0 ? AMBER : DOWN_COLOR },
  cpi:             { label: "Inflation",       signed: false, colorFn: v => v <= 2 ? UP_COLOR : v <= 5 ? AMBER : DOWN_COLOR },
  unemployment:    { label: "Chômage",         signed: false, colorFn: v => v <= 5 ? UP_COLOR : v <= 8 ? AMBER : DOWN_COLOR },
  debt_gdp:        { label: "Dette / PIB",     signed: false, colorFn: v => v <= 60 ? UP_COLOR : v <= 100 ? AMBER : DOWN_COLOR },
  current_account: { label: "Solde courant",   signed: true,  colorFn: v => v >= 0 ? UP_COLOR : DOWN_COLOR },
};

const INDICATOR_ORDER: IndicatorKey[] = [
  "gdp_growth", "cpi", "unemployment", "debt_gdp", "current_account",
];

type IndicatorValue = { value: number; year: string } | null;
type Country = {
  code: string;
  name: string;
  flag: string;
  indicators: Record<IndicatorKey, IndicatorValue>;
};

function fmt(key: IndicatorKey, value: number): string {
  const prefix = INDICATORS[key].signed && value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

export default function MacroPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/macro`)
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
        <div style={{ border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden", overflowX: "auto" }}>
          <table className="macro-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Pays</th>
                {INDICATOR_ORDER.map(key => (
                  <th key={key}>{INDICATORS[key].label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {countries.map((country, i) => (
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
      )}

      {!loading && !error && (
        <p style={{ color: "#2e2e2e", fontSize: "0.72rem", marginTop: "1rem" }}>
          Vert = favorable · Ambre = neutre · Rouge = défavorable · Données : FMI
        </p>
      )}
    </main>
  );
}

function MacroSkeleton() {
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
          {Array.from({ length: 7 }).map((_, i) => (
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
