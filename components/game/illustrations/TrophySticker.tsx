export function TrophySticker({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path
        d="M8 10 H24 V14 C24 19 20 22 16 22 C12 22 8 19 8 14 Z"
        fill="#EF3340"
        stroke="#2D1C15"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M6 10 C4 10 3 8 4 6 H8 M26 10 C28 10 29 8 28 6 H24"
        stroke="#2D1C15"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M13 22 V26 H19 V22" stroke="#2D1C15" strokeWidth="2.5" fill="none" />
      <rect x="11" y="26" width="10" height="3" rx="1" fill="#2D1C15" />
      <path
        d="M14 14 L16 17 L18 14"
        stroke="#FFF8E7"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
