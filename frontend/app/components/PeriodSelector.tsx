"use client";

import { PERIODS, type Period } from "../lib/constants";

type Props = { value: Period; onChange: (p: Period) => void };

export default function PeriodSelector({ value, onChange }: Props) {
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`btn-period${value === p ? " btn-period--active" : ""}`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
