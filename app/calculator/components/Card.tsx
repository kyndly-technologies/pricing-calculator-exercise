"use client";

export default function Card({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "20px",
        border: "1px solid #E5E5E5",
      }}
    >
      <label
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#6B6B6B",
          textTransform: "uppercase",
          letterSpacing: 1,
          display: "block",
          marginBottom: 12,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
