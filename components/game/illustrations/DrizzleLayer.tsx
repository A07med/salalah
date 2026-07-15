const DROPS = [
  { x: "12%", delay: "0s", h: 14 },
  { x: "28%", delay: "0.6s", h: 11 },
  { x: "45%", delay: "1.1s", h: 13 },
  { x: "63%", delay: "0.3s", h: 10 },
  { x: "78%", delay: "1.8s", h: 12 },
  { x: "88%", delay: "0.9s", h: 9 },
  { x: "35%", delay: "2.2s", h: 11 },
  { x: "55%", delay: "1.4s", h: 12 },
];

export function DrizzleLayer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {DROPS.map((drop, i) => (
        <span
          key={i}
          className="animate-journal-drizzle absolute w-0.5 rounded-full bg-[#B9D3CF] opacity-50"
          style={{
            left: drop.x,
            top: `${8 + (i % 3) * 12}%`,
            height: drop.h,
            animationDelay: drop.delay,
          }}
        />
      ))}
    </div>
  );
}
