"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE, CATEGORY_COLORS, API_TO_CATEGORY } from "../lib/constants";
import { ASSETS, type Category } from "../lib/assets";
import ChangeTag from "../components/ChangeTag";
import { formatPrice } from "../lib/utils";

type SnapshotItem = {
  category: string;
  asset: string;
  ticker: string;
  price: number;
  change_pct: number;
};

type EnrichedItem = SnapshotItem & {
  displayCategory: Category;
  name: string;
  symbol: string;
  apiPath: string;
};

function enrich(items: SnapshotItem[]): EnrichedItem[] {
  return items.flatMap((item) => {
    const cat = API_TO_CATEGORY[item.category];
    if (!cat) return [];
    const asset = ASSETS[cat]?.find((a) => a.apiPath === `/${item.category}/${item.asset}`);
    if (!asset) return [];
    return [{ ...item, displayCategory: cat, name: asset.name, symbol: asset.symbol, apiPath: asset.apiPath }];
  });
}

const CATEGORY_ORDER: Category[] = ["Matières premières", "Monnaies", "Cryptomonnaies"];

export default function Dashboard() {
  const [items, setItems]   = useState<EnrichedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/snapshot`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { setItems(enrich(data)); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <main style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Tableau de bord</h1>
        <p style={{ color: "#555", fontSize: "0.8rem", marginTop: "0.25rem", textTransform: "capitalize" }}>
          Variation sur 24h · {today}
        </p>
      </div>

      {error && (
        <p style={{ color: "#555", fontSize: "0.875rem" }}>Impossible de charger les données. L'API est-elle démarrée ?</p>
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {CATEGORY_ORDER.map((cat) => {
            const catItems = items
              .filter((i) => i.displayCategory === cat)
              .sort((a, b) => {
                const ai = ASSETS[cat].findIndex((x) => x.apiPath === a.apiPath);
                const bi = ASSETS[cat].findIndex((x) => x.apiPath === b.apiPath);
                return ai - bi;
              });
            if (catItems.length === 0) return null;
            const color = CATEGORY_COLORS[cat];
            return (
              <section key={cat}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666" }}>
                    {cat}
                  </span>
                </div>
                <div style={{ border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
                  {catItems.map((item, i) => (
                    <Link
                      key={item.asset}
                      href={`/marches/${encodeURIComponent(item.ticker)}`}
                      className="dash-row"
                      style={{ borderTop: i === 0 ? "none" : "1px solid #141414" }}
                    >
                      <span className="dash-row__symbol" style={{ color }}>{item.symbol}</span>
                      <span className="dash-row__name">{item.name}</span>
                      <span className="dash-row__price">{formatPrice(item.price)}</span>
                      <span className="dash-row__change"><ChangeTag value={item.change_pct} /></span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {[6, 6, 6].map((count, si) => (
        <section key={si}>
          <div style={{ width: 130, height: 11, background: "#1a1a1a", borderRadius: 4, marginBottom: "0.75rem" }} />
          <div style={{ border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="dash-row" style={{ borderTop: i === 0 ? "none" : "1px solid #141414", cursor: "default" }}>
                <div style={{ width: 44, height: 11, background: "#1a1a1a", borderRadius: 3 }} />
                <div style={{ width: "55%", height: 11, background: "#1a1a1a", borderRadius: 3 }} />
                <div style={{ width: 72, height: 11, background: "#1a1a1a", borderRadius: 3, justifySelf: "end" }} />
                <div style={{ width: 48, height: 11, background: "#1a1a1a", borderRadius: 3, justifySelf: "end" }} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
