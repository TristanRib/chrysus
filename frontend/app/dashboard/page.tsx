"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE, CATEGORY_COLORS, API_TO_CATEGORY, UP_COLOR, DOWN_COLOR } from "../lib/constants";
import { ASSETS, CATEGORIES, type Category } from "../lib/assets";
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

export default function Dashboard() {
  const [items, setItems]     = useState<EnrichedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

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

      {loading ? <DashboardSkeleton /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <MarketSummary items={items} />
          <TopMovers items={items} />

          {CATEGORIES.map((cat) => {
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

function MarketSummary({ items }: { items: EnrichedItem[] }) {
  if (!items.length) return null;
  const up  = items.filter(i => i.change_pct >= 0).length;
  const down = items.length - up;
  const avg = items.reduce((s, i) => s + i.change_pct, 0) / items.length;

  return (
    <div style={{
      display: "flex", gap: "1.5rem", alignItems: "center",
      padding: "0.8rem 1.25rem",
      background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 10,
    }}>
      <span style={{ fontSize: "0.8rem", color: UP_COLOR }}>↑ {up} en hausse</span>
      <span style={{ color: "#222", fontSize: "0.7rem" }}>|</span>
      <span style={{ fontSize: "0.8rem", color: DOWN_COLOR }}>↓ {down} en baisse</span>
      <span style={{ color: "#222", fontSize: "0.7rem" }}>|</span>
      <span style={{ fontSize: "0.8rem", color: "#555" }}>
        Variation moyenne&nbsp;
        <span style={{ color: avg >= 0 ? UP_COLOR : DOWN_COLOR, fontWeight: 600 }}>
          {avg >= 0 ? "+" : ""}{avg.toFixed(2)}%
        </span>
      </span>
    </div>
  );
}

function TopMovers({ items }: { items: EnrichedItem[] }) {
  if (!items.length) return null;
  const sorted  = [...items].sort((a, b) => b.change_pct - a.change_pct);
  const gainers = sorted.slice(0, 3);
  const losers  = sorted.slice(-3).reverse();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
      <MoverList label="Meilleures hausses" items={gainers} />
      <MoverList label="Plus fortes baisses" items={losers} />
    </div>
  );
}

function MoverList({ label, items }: { label: string; items: EnrichedItem[] }) {
  const isGain = label.includes("hausse");
  return (
    <div style={{ border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "0.55rem 1rem", background: "#0d0d0d", borderBottom: "1px solid #1a1a1a" }}>
        <span style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: isGain ? "#2a4a2a" : "#4a2a2a" }}>
          {isGain ? "▲" : "▼"} {label}
        </span>
      </div>
      {items.map((item, i) => {
        const color = CATEGORY_COLORS[item.displayCategory];
        return (
          <Link
            key={item.asset}
            href={`/marches/${encodeURIComponent(item.ticker)}`}
            className="mover-row"
            style={{ borderTop: i === 0 ? "none" : "1px solid #141414" }}
          >
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color, fontFamily: "monospace", minWidth: 44 }}>
              {item.symbol}
            </span>
            <span style={{ fontSize: "0.8rem", color: "#888", flex: 1 }}>{item.name}</span>
            <ChangeTag value={item.change_pct} />
          </Link>
        );
      })}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ height: 42, background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 10 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {[0, 1].map(j => (
          <div key={j} style={{ border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ height: 33, background: "#0d0d0d", borderBottom: "1px solid #1a1a1a" }} />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="mover-row" style={{ borderTop: i === 0 ? "none" : "1px solid #141414", cursor: "default" }}>
                <div style={{ width: 40, height: 11, background: "#1a1a1a", borderRadius: 3 }} />
                <div style={{ width: "50%", height: 11, background: "#1a1a1a", borderRadius: 3 }} />
                <div style={{ width: 48, height: 11, background: "#1a1a1a", borderRadius: 3 }} />
              </div>
            ))}
          </div>
        ))}
      </div>
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
