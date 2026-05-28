"use client";

import { useEffect, useState, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import PeriodSelector from "./PeriodSelector";
import { API_BASE, CHART_STYLE, COMPARE_PALETTE, type Period } from "../lib/constants";
import { ASSETS, CATEGORIES, type Asset, type Category } from "../lib/assets";

type DataPoint   = { date: string; close: number };
type SelectedItem = { asset: Asset; color: string };

const DEFAULT: SelectedItem[] = [
  { asset: ASSETS["Matières premières"][0], color: COMPARE_PALETTE[0] },
  { asset: ASSETS["Cryptomonnaies"][0],     color: COMPARE_PALETTE[1] },
];

function pickColor(current: SelectedItem[]): string {
  const used = new Set(current.map((s) => s.color));
  return [...COMPARE_PALETTE].find((c) => !used.has(c)) ?? COMPARE_PALETTE[current.length % COMPARE_PALETTE.length];
}

function mergeNormalized(results: { item: SelectedItem; data: DataPoint[] }[]) {
  const map = new Map<string, Record<string, number | string>>();
  for (const { item, data } of results) {
    if (!data.length) continue;
    const first = data[0].close;
    for (const pt of data) {
      if (!map.has(pt.date)) map.set(pt.date, { date: pt.date });
      map.get(pt.date)![item.asset.ticker] = parseFloat((((pt.close - first) / first) * 100).toFixed(3));
    }
  }
  return Array.from(map.values()).sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

export default function CompareView() {
  const [selected, setSelected]       = useState<SelectedItem[]>(DEFAULT);
  const [period, setPeriod]           = useState<Period>("1mo");
  const [activeCategory, setCategory] = useState<Category>(CATEGORIES[0]);
  const [chartData, setChartData]     = useState<ReturnType<typeof mergeNormalized>>([]);
  const [loading, setLoading]         = useState(false);

  const toggle = useCallback((asset: Asset) => {
    setSelected((prev) => {
      const exists = prev.find((s) => s.asset.ticker === asset.ticker);
      if (exists) return prev.filter((s) => s.asset.ticker !== asset.ticker);
      if (prev.length >= COMPARE_PALETTE.length) return prev;
      return [...prev, { asset, color: pickColor(prev) }];
    });
  }, []);

  useEffect(() => {
    if (!selected.length) { setChartData([]); return; }
    setLoading(true);
    Promise.all(
      selected.map((item) =>
        fetch(`${API_BASE}${item.asset.apiPath}?period=${period}`)
          .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
          .then((j) => ({ item, data: j.data as DataPoint[] }))
          .catch(() => ({ item, data: [] as DataPoint[] }))
      )
    ).then((results) => { setChartData(mergeNormalized(results)); setLoading(false); });
  }, [selected, period]);

  return (
    <div>
      <PeriodSelector value={period} onChange={setPeriod} />

      {/* Picker */}
      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: "1rem", margin: "1.5rem 0" }}>
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.85rem" }}>
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{
                padding: "0.25rem 0.75rem", borderRadius: 6, border: "1px solid", cursor: "pointer",
                fontSize: "0.78rem", fontWeight: 500, transition: "all 0.15s",
                background:  activeCategory === cat ? "#1e1e1e" : "transparent",
                borderColor: activeCategory === cat ? "#333"    : "#1e1e1e",
                color:       activeCategory === cat ? "#e5e5e5" : "#555",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {ASSETS[activeCategory].map((asset) => {
            const match = selected.find((s) => s.asset.ticker === asset.ticker);
            const isOn  = !!match;
            const color = match?.color;
            const maxed = !isOn && selected.length >= COMPARE_PALETTE.length;
            return (
              <button key={asset.ticker} onClick={() => toggle(asset)} disabled={maxed}
                style={{
                  padding: "0.3rem 0.75rem", borderRadius: 6, cursor: maxed ? "not-allowed" : "pointer",
                  fontSize: "0.8rem", fontWeight: 500, transition: "all 0.15s", opacity: maxed ? 0.4 : 1,
                  border:     `1px solid ${isOn ? color : "#2a2a2a"}`,
                  background: isOn ? `${color}18` : "transparent",
                  color:      isOn ? color        : maxed ? "#2e2e2e" : "#666",
                }}
              >
                {asset.symbol} · {asset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected tags */}
      {selected.length > 0 && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {selected.map(({ asset, color }) => (
            <span key={asset.ticker}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                padding: "0.2rem 0.5rem 0.2rem 0.6rem", borderRadius: 20, fontSize: "0.75rem", color,
                background: `${color}14`, border: `1px solid ${color}44`,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
              {asset.name}
              <button onClick={() => toggle(asset)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: "0 0 0 2px", lineHeight: 1, fontSize: "1rem", opacity: 0.6 }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Chart */}
      {loading && <div style={{ height: 340, display: "flex", alignItems: "center", color: "#444" }}>Chargement...</div>}

      {!loading && !chartData.length && (
        <div style={{ height: 340, display: "flex", alignItems: "center", justifyContent: "center", color: "#333", border: "1px dashed #1a1a1a", borderRadius: 10 }}>
          Sélectionne au moins un actif
        </div>
      )}

      {!loading && chartData.length > 0 && (
        <>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid {...CHART_STYLE.grid} />
              <XAxis dataKey="date" {...CHART_STYLE.xAxis} />
              <YAxis {...CHART_STYLE.yAxis} tickFormatter={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`} width={60} />
              <Tooltip {...CHART_STYLE.tooltip}
                formatter={(value: number, key: string) => {
                  const label = selected.find((s) => s.asset.ticker === key)?.asset.name ?? key;
                  return [`${value >= 0 ? "+" : ""}${value.toFixed(2)}%`, label];
                }}
              />
              {selected.map(({ asset, color }) => (
                <Line key={asset.ticker} type="monotone" dataKey={asset.ticker}
                  stroke={color} strokeWidth={2} dot={false} connectNulls activeDot={{ r: 4, fill: color }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <p style={{ color: "#333", fontSize: "0.72rem", marginTop: "0.75rem" }}>
            Variation % depuis le début de la période · max {COMPARE_PALETTE.length} actifs
          </p>
        </>
      )}
    </div>
  );
}
