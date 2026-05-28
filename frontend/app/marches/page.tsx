"use client";

import { useState } from "react";
import Link from "next/link";
import { ASSETS, CATEGORIES, type Category } from "../lib/assets";
import { CATEGORY_COLORS } from "../lib/constants";
import CompareView from "../components/CompareView";

type Mode = "explorer" | "comparer";

export default function MarchesPage() {
  const [mode, setMode]     = useState<Mode>("explorer");
  const [active, setActive] = useState<Category>(CATEGORIES[0]);
  const assets = ASSETS[active];
  const color  = CATEGORY_COLORS[active];

  return (
    <main style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Marchés</h1>

        <div style={{ display: "flex", border: "1px solid #222", borderRadius: 8, overflow: "hidden" }}>
          {(["explorer", "comparer"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              style={{
                padding: "0.35rem 1rem", border: "none",
                borderLeft: m === "comparer" ? "1px solid #222" : "none",
                background: mode === m ? "#1e1e1e" : "transparent",
                color:      mode === m ? "#e5e5e5" : "#555",
                cursor: "pointer", fontSize: "0.8rem", fontWeight: 500,
                transition: "all 0.15s", textTransform: "capitalize",
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {mode === "explorer" && (
        <>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => {
              const isActive = cat === active;
              const c = CATEGORY_COLORS[cat];
              return (
                <button key={cat} onClick={() => setActive(cat)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.5rem 1.1rem", borderRadius: 8, cursor: "pointer",
                    fontSize: "0.875rem", fontWeight: 500, transition: "all 0.15s",
                    border:     `1px solid ${isActive ? c : "#2a2a2a"}`,
                    background: isActive ? `${c}14` : "transparent",
                    color:      isActive ? c : "#666",
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: isActive ? c : "#444", flexShrink: 0 }} />
                  {cat}
                  <span style={{
                    marginLeft: "0.25rem", borderRadius: 4, padding: "0 0.35rem",
                    fontSize: "0.75rem", fontWeight: 600,
                    background: isActive ? `${c}22` : "#1a1a1a",
                    color:      isActive ? c : "#555",
                  }}>
                    {ASSETS[cat].length}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem" }}>
            {assets.map((asset) => (
              <Link key={asset.ticker} href={`/marches/${encodeURIComponent(asset.ticker)}`} style={{ textDecoration: "none" }}>
                <div className="asset-card" style={{ "--accent": color } as React.CSSProperties}>
                  <span className="asset-card__symbol">{asset.symbol}</span>
                  <span className="asset-card__name">{asset.name}</span>
                  <span className="asset-card__ticker">{asset.ticker}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {mode === "comparer" && <CompareView />}
    </main>
  );
}
