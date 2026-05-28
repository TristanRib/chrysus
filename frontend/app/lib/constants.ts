import type { Category } from "./assets";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const PERIODS = ["1d", "5d", "1mo", "3mo", "6mo", "1y"] as const;
export type Period = (typeof PERIODS)[number];

export const CATEGORY_COLORS: Record<Category, string> = {
  "Matières premières": "#f5c842",
  "Monnaies":           "#60a5fa",
  "Cryptomonnaies":     "#a78bfa",
};

export const COMPARE_PALETTE = [
  "#f5c842", "#60a5fa", "#a78bfa",
  "#4ade80", "#fb923c", "#f472b6",
] as const;

export const UP_COLOR   = "#4ade80";
export const DOWN_COLOR = "#f87171";

export const API_TO_CATEGORY: Record<string, Category> = {
  "commodities": "Matières premières",
  "forex":       "Monnaies",
  "crypto":      "Cryptomonnaies",
};

export const CHART_STYLE = {
  grid:    { strokeDasharray: "3 3", stroke: "#1f1f1f" },
  xAxis:   { tick: { fill: "#666", fontSize: 11 }, tickLine: false, axisLine: { stroke: "#222" }, interval: "preserveStartEnd" as const },
  yAxis:   { tick: { fill: "#666", fontSize: 11 }, tickLine: false, axisLine: false as const },
  tooltip: { contentStyle: { background: "#111", border: "1px solid #333", borderRadius: 8 }, labelStyle: { color: "#888", fontSize: 12 } },
} as const;
