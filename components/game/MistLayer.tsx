"use client";

interface MistLayerProps {
  className?: string;
}

export function MistLayer({ className = "" }: MistLayerProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 z-[2] ${className}`} aria-hidden>
      <div className="absolute bottom-0 left-[-10%] right-[-10%] h-[45%] bg-gradient-to-t from-khareef-mist/35 via-khareef-mist/15 to-transparent animate-mist-rise" />

      <div
        className="absolute top-[38%] left-[-20%] h-28 w-[70%] rounded-full bg-white/10 blur-3xl animate-fog-drift"
        style={{ animationDuration: "11s" }}
      />
      <div
        className="absolute top-[48%] right-[-15%] h-24 w-[65%] rounded-full bg-khareef-mist/20 blur-3xl animate-fog-drift-reverse"
        style={{ animationDuration: "14s" }}
      />
      <div
        className="absolute top-[55%] left-[10%] h-20 w-[55%] rounded-full bg-white/8 blur-2xl animate-fog-drift"
        style={{ animationDuration: "9s", animationDelay: "1.5s" }}
      />
      <div className="absolute top-1/3 left-0 right-0 h-20 bg-gradient-to-b from-transparent via-khareef-mist/10 to-transparent animate-fog-drift-reverse" />
    </div>
  );
}
