/**
 * Redrawn from public-domain Köhler Boswellia botanical plate (1887).
 * Attribution: /assets/open-source/ATTRIBUTIONS.md
 */
export function FrankincenseSticker({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 88"
      className={`game-sticker-shadow ${className}`}
      aria-hidden
    >
      {/* Central knotted branch */}
      <path
        d="M36 84 C36 70 34 58 36 48 C38 36 36 22 36 8"
        stroke="#7A4B30"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M36 84 C36 70 34 58 36 48 C38 36 36 22 36 8"
        stroke="#2D1C15"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse
        cx="36"
        cy="50"
        rx="6.5"
        ry="5.5"
        fill="#7A4B30"
        stroke="#2D1C15"
        strokeWidth="3"
      />

      {/* Left compound leaf group — Boswellia pinnate pairs */}
      <path
        d="M36 40 L20 34"
        stroke="#7A4B30"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <g fill="#527A59" stroke="#2D1C15" strokeWidth="2.5" strokeLinejoin="round">
        <ellipse cx="16" cy="22" rx="10" ry="4" transform="rotate(-38 16 22)" />
        <ellipse cx="12" cy="32" rx="9" ry="3.5" transform="rotate(-28 12 32)" />
        <ellipse cx="14" cy="42" rx="8" ry="3" transform="rotate(-18 14 42)" />
      </g>

      {/* Right compound leaf group */}
      <path
        d="M36 44 L52 38"
        stroke="#7A4B30"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <g fill="#527A59" stroke="#2D1C15" strokeWidth="2.5" strokeLinejoin="round">
        <ellipse cx="56" cy="26" rx="10" ry="4" transform="rotate(38 56 26)" />
        <ellipse cx="60" cy="36" rx="9" ry="3.5" transform="rotate(28 60 36)" />
        <ellipse cx="58" cy="46" rx="8" ry="3" transform="rotate(18 58 46)" />
      </g>

      {/* Upper leaflet pair */}
      <g fill="#527A59" stroke="#2D1C15" strokeWidth="2.5" strokeLinejoin="round">
        <ellipse cx="26" cy="14" rx="8" ry="3.5" transform="rotate(-22 26 14)" />
        <ellipse cx="46" cy="12" rx="8" ry="3.5" transform="rotate(22 46 12)" />
      </g>

      {/* Resin pieces */}
      <path
        d="M30 78 C32 74 36 74 38 78 C36 82 32 82 30 78 Z"
        fill="#7A4B30"
        stroke="#2D1C15"
        strokeWidth="2.5"
      />
      <circle
        cx="50"
        cy="80"
        r="4"
        fill="#E8C9A0"
        stroke="#2D1C15"
        strokeWidth="2"
      />
    </svg>
  );
}
