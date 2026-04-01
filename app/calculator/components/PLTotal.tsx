"use client";

import { f } from "./formatting";

export default function PLTotal({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 0 4px",
        borderTop: "1px solid #E5E5E5",
        marginTop: 4,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, color }}>{label}</span>
      <span
        style={{
          fontSize: 15,
          fontWeight: 700,
          color,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {f(value)}
      </span>
    </div>
  );
}
