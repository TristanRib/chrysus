"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import PeriodSelector from "./PeriodSelector";
import { API_BASE, CHART_STYLE, UP_COLOR, DOWN_COLOR, type Period } from "../lib/constants";
import { formatPrice } from "../lib/utils";

type DataPoint = { date: string; close: number };

type Props = {
  apiPath: string;
  period?: Period;
  onPeriodChange?: (p: Period) => void;
};

export default function AssetChart({ apiPath, period: controlledPeriod, onPeriodChange }: Props) {
  const [internalPeriod, setInternalPeriod] = useState<Period>("1mo");
  const period = controlledPeriod ?? internalPeriod;
  const setPeriod = (p: Period) => {
    setInternalPeriod(p);
    onPeriodChange?.(p);
  };

  const [data, setData]       = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}${apiPath}?period=${period}`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((j) => setData(j.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [apiPath, period]);

  const latest = data.at(-1);
  const first  = data.at(0);
  const change    = latest && first ? latest.close - first.close : null;
  const changePct = change && first  ? (change / first.close) * 100 : null;
  const isUp      = (change ?? 0) >= 0;

  return (
    <div>
      <PeriodSelector value={period} onChange={setPeriod} />

      {latest && (
        <div style={{ margin: "1.25rem 0" }}>
          <span style={{ fontSize: "2rem", fontWeight: 700, color: "#f5c842" }}>
            {formatPrice(latest.close)}
          </span>
          {changePct !== null && (
            <span style={{ marginLeft: "0.75rem", color: isUp ? UP_COLOR : DOWN_COLOR, fontSize: "0.95rem" }}>
              {isUp ? "+" : ""}{change?.toFixed(2)} ({isUp ? "+" : ""}{changePct.toFixed(2)}%)
            </span>
          )}
        </div>
      )}

      {loading && <div style={{ height: 320, display: "flex", alignItems: "center", color: "#555" }}>Chargement...</div>}
      {error   && <p style={{ color: "#f87171" }}>Erreur : {error}</p>}

      {!loading && !error && (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <CartesianGrid {...CHART_STYLE.grid} />
            <XAxis    dataKey="date" {...CHART_STYLE.xAxis} />
            <YAxis    domain={["auto", "auto"]} {...CHART_STYLE.yAxis} tickFormatter={(v) => `$${v.toLocaleString()}`} width={75} />
            <Tooltip  {...CHART_STYLE.tooltip} itemStyle={{ color: "#f5c842" }}
              formatter={(v: number) => [`$${v.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, "Close"]}
            />
            <Line type="monotone" dataKey="close" stroke="#f5c842" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#f5c842" }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
