/**
 * Geometry informed by Delapouite "Coconuts" (Game Icons, CC BY 3.0).
 * Attribution: /assets/open-source/ATTRIBUTIONS.md
 */
export function CoconutHalfSticker({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={`game-sticker-shadow ${className}`}
      aria-hidden
    >
      {/* Asymmetric husk shell — Delapouite-inspired ovoid, not a circle */}
      <path
        d="M14 54 C10 40 16 24 30 14 C46 6 64 8 78 18 C90 28 94 44 92 60 C90 76 80 88 64 94 C48 98 30 92 18 80 C10 70 10 58 14 54 Z"
        fill="#7A4B30"
        stroke="#2D1C15"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Flat cut face with white flesh */}
      <path
        d="M14 54 L14 80 C24 92 42 98 58 94 L58 50 C42 48 26 50 14 54 Z"
        fill="#FFF8E7"
        stroke="#2D1C15"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Flesh crease */}
      <path
        d="M20 60 C32 66 44 68 54 62"
        stroke="#E8C9A0"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Fibrous husk lines */}
      <path
        d="M62 20 C72 34 78 50 74 68"
        stroke="#5C3A1E"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M44 14 C50 30 52 48 48 66"
        stroke="#5C3A1E"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M80 30 C84 46 82 62 74 76"
        stroke="#5C3A1E"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}
