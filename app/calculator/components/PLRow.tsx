"use client";

import { f } from "./formatting";

export default function PLRow({
  label,
  value,
  neg,
}: {
  label: string;
  value: number;
  neg?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "5px 0",
        fontSize: 12,
      }}
    >
      <span style={{ color: "#6B6B6B" }}>{label}</span>
      <span
        style={{
          fontWeight: 600,
          color: neg ? "#B85042" : "#2B2B2B",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {f(value)}
      </span>
    </div>
  );
}
