"use client";

interface RainEffectProps {
  density?: number;
}

export function RainEffect({ density = 42 }: RainEffectProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden z-[3]"
      aria-hidden
    >
      {Array.from({ length: density }).map((_, i) => {
        const left = (i * 7.3 + (i % 5) * 2.1) % 100;
        const height = 10 + (i % 6) * 5;
        const opacity = 0.2 + (i % 4) * 0.08;
        const delay = (i * 0.11) % 2.4;
        const duration = 0.55 + (i % 5) * 0.12;
        const tilt = -8 - (i % 4);

        return (
          <div
            key={i}
            className="absolute w-px rounded-full bg-rain-blue animate-rain"
            style={{
              left: `${left}%`,
              height: `${height}px`,
              opacity,
              transform: `rotate(${tilt}deg)`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              width: i % 7 === 0 ? "1.5px" : "1px",
            }}
          />
        );
      })}
    </div>
  );
}
