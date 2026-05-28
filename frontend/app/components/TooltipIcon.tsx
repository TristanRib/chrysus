"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

type Props = { text: string };

export default function TooltipIcon({ text }: Props) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  return (
    <>
      <span
        style={{ cursor: "default", color: "#333", fontSize: "0.6rem", marginLeft: "0.3rem", userSelect: "none" }}
        onMouseEnter={(e) => {
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
          setPos({ x: r.left + r.width / 2, y: r.top - 10 });
        }}
        onMouseLeave={() => setPos(null)}
      >
        ⓘ
      </span>
      {pos && createPortal(
        <div style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          transform: "translate(-50%, -100%)",
          background: "#161616",
          border: "1px solid #2a2a2a",
          color: "#999",
          fontSize: "0.75rem",
          fontWeight: 400,
          padding: "0.5rem 0.8rem",
          borderRadius: 7,
          width: 210,
          lineHeight: 1.6,
          zIndex: 1000,
          pointerEvents: "none",
        }}>
          {text}
        </div>,
        document.body
      )}
    </>
  );
}
