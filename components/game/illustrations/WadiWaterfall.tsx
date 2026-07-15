/** Wadi Darbat-inspired waterfall sticker for journal backdrop */
export function WadiWaterfall({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 100" className={className} aria-hidden>
      <path
        d="M20 88 L20 36 L36 20 L52 36 L52 88 Z"
        fill="#315541"
        stroke="#2D1C15"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M32 38 L32 82 M40 32 L40 86 M48 38 L48 82"
        stroke="#FFF8E7"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.85"
      />
      <ellipse cx="40" cy="90" rx="18" ry="5" fill="#B9D3CF" opacity="0.45" />
      <circle cx="34" cy="48" r="2" fill="#B9D3CF" opacity="0.7" />
      <circle cx="46" cy="56" r="1.5" fill="#B9D3CF" opacity="0.6" />
    </svg>
  );
}
