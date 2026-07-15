/** Misty Dhofar mountain silhouettes with integrated wadi falls — anchored to bottom */
export function DhofarMountains({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 140"
      className={className}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
    >
      {/* Far ridge */}
      <path
        d="M0 118 L55 72 L98 96 L145 54 L198 82 L252 44 L310 72 L360 56 L400 84 L400 140 L0 140 Z"
        fill="#315541"
        opacity="0.34"
      />
      {/* Near ridge */}
      <path
        d="M0 132 L72 94 L128 112 L188 78 L248 100 L318 82 L400 104 L400 140 L0 140 Z"
        fill="#527A59"
        opacity="0.4"
      />

      {/* Organic wadi cliff + stream (left) */}
      <path
        d="M18 132 L18 98 C22 88 30 82 38 78 C44 76 48 80 50 88 L52 132 Z"
        fill="#315541"
        stroke="#2D1C15"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path
        d="M34 82 C36 96 37 110 38 124"
        stroke="#FFF8E7"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M40 86 C41 100 42 114 43 128"
        stroke="#B9D3CF"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <ellipse cx="40" cy="130" rx="10" ry="4" fill="#B9D3CF" opacity="0.45" />
    </svg>
  );
}
