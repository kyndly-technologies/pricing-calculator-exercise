"use client";

export default function SectionLabel({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        color,
        textTransform: "uppercase",
        letterSpacing: 1.5,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}
