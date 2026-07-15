"use client";

interface MountainLayerProps {
  className?: string;
}

export function MountainLayer({ className = "" }: MountainLayerProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      {/* Distant mountains */}
      <svg
        className="absolute bottom-[18%] left-0 w-full h-[42%]"
        viewBox="0 0 390 220"
        preserveAspectRatio="none"
      >
        <path
          d="M0 220 L0 120 L45 70 L90 110 L140 40 L200 100 L250 55 L310 95 L360 50 L390 90 L390 220 Z"
          fill="#0f2a1e"
          opacity="0.95"
        />
        <path
          d="M0 220 L0 145 L55 95 L110 130 L165 75 L230 120 L285 80 L340 115 L390 85 L390 220 Z"
          fill="#163d2c"
          opacity="0.9"
        />
      </svg>

      {/* Mid hills */}
      <svg
        className="absolute bottom-[8%] left-0 w-full h-[32%]"
        viewBox="0 0 390 160"
        preserveAspectRatio="none"
      >
        <path
          d="M0 160 L0 90 L40 55 L85 85 L130 40 L180 75 L230 35 L290 70 L340 45 L390 80 L390 160 Z"
          fill="#1f4f38"
        />
        <path
          d="M0 160 L0 110 L60 75 L120 100 L175 60 L245 95 L310 65 L390 100 L390 160 Z"
          fill="#2d6347"
          opacity="0.85"
        />
      </svg>

      {/* Foreground grass */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[14%]"
        viewBox="0 0 390 80"
        preserveAspectRatio="none"
      >
        <path
          d="M0 80 L0 35 Q40 20 70 32 Q110 18 150 30 Q190 15 230 28 Q280 12 320 26 Q355 16 390 30 L390 80 Z"
          fill="#3d6b4a"
        />
        <path
          d="M0 80 L0 50 Q50 38 90 48 Q140 36 180 46 Q230 34 280 44 Q330 36 390 48 L390 80 Z"
          fill="#4a7c59"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}
