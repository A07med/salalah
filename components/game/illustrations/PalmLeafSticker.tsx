export function PalmLeafSticker({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path
        d="M50 6 C28 16 14 38 18 62 C22 82 34 94 50 98 C66 94 78 82 82 62 C86 38 72 16 50 6 Z"
        fill="#527A59"
        stroke="#2D1C15"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M50 18 L50 88 M34 36 L66 58 M30 56 L70 44 M38 74 L62 54"
        stroke="#2D1C15"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}
