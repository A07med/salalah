"use client";

interface MissCounterProps {
  missCount: number;
  maxMisses: number;
}

export function MissCounter({ missCount, maxMisses }: MissCounterProps) {
  return (
    <div className="stall-hud-card px-3 py-1.5">
      <p className="mb-1.5 text-[10px] font-bold text-stall-ink/70">الأخطاء</p>
      <div className="flex gap-1.5">
        {Array.from({ length: maxMisses }).map((_, i) => {
          const used = i < missCount;
          return (
            <svg
              key={i}
              viewBox="0 0 20 22"
              className="h-5 w-4"
              aria-hidden
            >
              <ellipse
                cx="10"
                cy="12"
                rx="7.5"
                ry="8"
                fill={used ? "#EF3340" : "var(--stall-cream)"}
                stroke="#2D1C15"
                strokeWidth="2.5"
              />
              {used ? (
                <path
                  d="M6 9 L14 15 M14 9 L6 15"
                  stroke="#FFF8E7"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M5 12 L15 12"
                  stroke="#2D1C15"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.35"
                />
              )}
            </svg>
          );
        })}
      </div>
    </div>
  );
}
