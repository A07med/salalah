/** Soft flat fog bands — no blur filters */
export function MistLayers({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 80"
      className={`animate-journal-mist ${className}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <ellipse cx="120" cy="42" rx="110" ry="18" fill="#B9D3CF" opacity="0.35" />
      <ellipse cx="280" cy="52" rx="130" ry="20" fill="#B9D3CF" opacity="0.28" />
      <ellipse cx="200" cy="30" rx="90" ry="14" fill="#B9D3CF" opacity="0.22" />
    </svg>
  );
}
