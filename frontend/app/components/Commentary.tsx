"use client";

import { useState } from "react";
import { API_BASE, type Period } from "../lib/constants";

type Mode   = "quick" | "detailed";
type Status = "idle" | "loading" | "done" | "error";

const MODE_LABEL: Record<Mode, string> = {
  quick:    "Analyse · llama-3.1-8b",
  detailed: "Analyse détaillée · compound-mini",
};

type Props = { apiPath: string; period: Period };

export default function Commentary({ apiPath, period }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [mode, setMode]     = useState<Mode>("quick");
  const [text, setText]     = useState<string | null>(null);

  function request(m: Mode) {
    setMode(m);
    setStatus("loading");
    setText(null);
    fetch(`${API_BASE}/commentary${apiPath}?period=${period}&mode=${m}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((j) => { setText(j.commentary); setStatus("done"); })
      .catch(() => setStatus("error"));
  }

  if (status === "idle") return (
    <div style={{ marginTop: "2rem", display: "flex", gap: "0.5rem" }}>
      <button onClick={() => request("quick")}    className="btn-commentary">Analyser</button>
      <button onClick={() => request("detailed")} className="btn-commentary">Rechercher l'actualité</button>
    </div>
  );

  if (status === "loading") return (
    <div style={{ marginTop: "2rem", padding: "1rem", borderRadius: 8, background: "#111", border: "1px solid #1e1e1e" }}>
      <div style={{ width: "60%", height: 11, background: "#1a1a1a", borderRadius: 4, marginBottom: 8 }} />
      <div style={{ width: "85%", height: 11, background: "#1a1a1a", borderRadius: 4, marginBottom: 8 }} />
      <div style={{ width: "45%", height: 11, background: "#1a1a1a", borderRadius: 4 }} />
    </div>
  );

  if (status === "error") return (
    <div style={{ marginTop: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
      <span style={{ fontSize: "0.8rem", color: "#333" }}>Analyse indisponible</span>
      <button onClick={() => request(mode)} className="btn-commentary">Réessayer</button>
    </div>
  );

  return (
    <div style={{ marginTop: "2rem", padding: "1rem 1.25rem", borderRadius: 8, background: "#111", border: "1px solid #1e1e1e" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
        <span style={{ fontSize: "0.7rem", color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {MODE_LABEL[mode]}
        </span>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {(["quick", "detailed"] as Mode[]).filter(m => m !== mode).map(m => (
            <button key={m} onClick={() => request(m)} className="btn-switch">
              {m === "quick" ? "Analyser" : "Rechercher l'actualité"}
            </button>
          ))}
          <button onClick={() => request(mode)} title="Regénérer" className="btn-regen">
            ↺
          </button>
        </div>
      </div>
      <p style={{ fontSize: "0.875rem", color: "#aaa", lineHeight: 1.7, margin: 0 }}>{text}</p>
    </div>
  );
}
