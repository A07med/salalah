"use client";

interface MissFlashProps {
  flashKey: number;
  active: boolean;
}

export function MissFlash({ flashKey, active }: MissFlashProps) {
  if (!active) return null;

  return (
    <div
      key={flashKey}
      className="pointer-events-none absolute inset-0 z-40 animate-miss-flash"
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 40%, rgba(239,68,68,0.35) 100%)",
      }}
      aria-hidden
    />
  );
}
