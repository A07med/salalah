"use client";

interface PalmCanopyProps {
  className?: string;
  compact?: boolean;
}

function PalmFrond({
  d,
  fill,
  className,
  delay = 0,
}: {
  d: string;
  fill: string;
  className?: string;
  delay?: number;
}) {
  return (
    <path
      d={d}
      fill={fill}
      className={className}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

export function PalmCanopy({ className = "", compact = false }: PalmCanopyProps) {
  return (
    <div
      className={`pointer-events-none absolute top-0 left-0 right-0 z-[4] ${
        compact ? "h-36" : "h-48"
      } ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 390 200"
        className="h-full w-full"
        preserveAspectRatio="xMidYMin meet"
      >
        <defs>
          <linearGradient id="palmGradA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6bb07a" />
            <stop offset="55%" stopColor="#3d7a4f" />
            <stop offset="100%" stopColor="#245536" />
          </linearGradient>
          <linearGradient id="palmGradB" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7ec48a" />
            <stop offset="50%" stopColor="#4a8f5c" />
            <stop offset="100%" stopColor="#2a5c38" />
          </linearGradient>
          <linearGradient id="palmGradC" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#5fa06c" />
            <stop offset="100%" stopColor="#1e4a2c" />
          </linearGradient>
        </defs>

        {/* Crown hub */}
        <ellipse cx="195" cy="18" rx="28" ry="14" fill="#2d5a3a" />
        <ellipse cx="195" cy="14" rx="18" ry="9" fill="#3d7348" />

        {/* Left fronds */}
        <g className="animate-leaf-sway" style={{ transformOrigin: "195px 20px" }}>
          <PalmFrond
            d="M195 20 C150 25 95 55 40 95 C70 78 110 58 145 42 C160 35 178 26 195 20 Z"
            fill="url(#palmGradA)"
          />
          <PalmFrond
            d="M195 22 C155 40 110 75 55 125 C85 100 125 72 160 50 C172 40 185 28 195 22 Z"
            fill="url(#palmGradC)"
            delay={0.3}
          />
          <PalmFrond
            d="M190 18 C140 10 90 20 35 45 C75 32 120 22 155 18 C170 16 182 16 190 18 Z"
            fill="url(#palmGradB)"
            delay={0.6}
          />
        </g>

        {/* Right fronds */}
        <g
          className="animate-leaf-sway-reverse"
          style={{ transformOrigin: "195px 20px" }}
        >
          <PalmFrond
            d="M195 20 C240 25 295 55 350 95 C320 78 280 58 245 42 C230 35 212 26 195 20 Z"
            fill="url(#palmGradB)"
          />
          <PalmFrond
            d="M195 22 C235 40 280 75 335 125 C305 100 265 72 230 50 C218 40 205 28 195 22 Z"
            fill="url(#palmGradA)"
            delay={0.4}
          />
          <PalmFrond
            d="M200 18 C250 10 300 20 355 45 C315 32 270 22 235 18 C220 16 208 16 200 18 Z"
            fill="url(#palmGradC)"
            delay={0.7}
          />
        </g>

        {/* Center forward fronds */}
        <g className="animate-leaf-sway" style={{ transformOrigin: "195px 18px" }}>
          <PalmFrond
            d="M195 18 C175 55 165 100 155 150 C175 115 185 70 195 18 Z"
            fill="url(#palmGradA)"
            delay={0.2}
          />
          <PalmFrond
            d="M195 18 C215 55 225 100 235 150 C215 115 205 70 195 18 Z"
            fill="url(#palmGradB)"
            delay={0.5}
          />
          <PalmFrond
            d="M195 16 C185 50 180 95 178 140 C188 105 192 60 195 16 Z"
            fill="#3d7a4f"
            delay={0.1}
          />
        </g>

        {/* Leaflet veins */}
        <g opacity="0.25" stroke="#1a3d28" strokeWidth="1" fill="none">
          <path d="M195 22 C150 40 100 70 55 105" />
          <path d="M195 22 C240 40 290 70 335 105" />
          <path d="M195 20 C190 70 185 110 180 145" />
        </g>
      </svg>
    </div>
  );
}
