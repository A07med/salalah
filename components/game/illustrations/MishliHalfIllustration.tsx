/**
 * Split Mishli half — explicit paths, no clipPath/mask/CSS mirror.
 * Cut-face geometry informed by Microsoft Fluent Emoji Coconut (Flat), MIT.
 */
import {
  MISHLI_GREEN_BASE,
  MISHLI_GREEN_FIBRE,
  MISHLI_GREEN_LIGHT,
  MISHLI_GREEN_DEEP,
  MISHLI_FLESH,
  MISHLI_FLESH_CREASE,
  MISHLI_SHELL_EDGE,
  MISHLI_WET,
  MISHLI_INK,
  LEFT_HALF,
  RIGHT_HALF,
} from "./mishliPaths";

interface MishliHalfIllustrationProps {
  side: "left" | "right";
  className?: string;
  showShadow?: boolean;
}

function DrawHalf({ side }: { side: "left" | "right" }) {
  const half = side === "left" ? LEFT_HALF : RIGHT_HALF;

  return (
    <>
      <path
        d={half.husk}
        fill={MISHLI_GREEN_BASE}
        stroke={MISHLI_INK}
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      <path d={half.fibre} fill={MISHLI_GREEN_FIBRE} opacity="0.55" />
      <path
        d={half.fibreLines}
        stroke={MISHLI_GREEN_DEEP}
        strokeWidth="1.6"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />
      <ellipse
        cx={half.highlight.cx}
        cy={half.highlight.cy}
        rx={half.highlight.rx}
        ry={half.highlight.ry}
        fill={MISHLI_GREEN_LIGHT}
        opacity="0.35"
      />
      <path
        d={half.flesh}
        fill={MISHLI_FLESH}
        stroke={MISHLI_INK}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d={half.shellEdge}
        fill="none"
        stroke={MISHLI_SHELL_EDGE}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <ellipse
        cx={half.wet.cx}
        cy={half.wet.cy}
        rx={half.wet.rx}
        ry={half.wet.ry}
        fill={MISHLI_WET}
        opacity="0.5"
      />
      <path
        d={half.crease}
        stroke={MISHLI_FLESH_CREASE}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
    </>
  );
}

export function MishliHalfIllustration({
  side,
  className = "h-[12rem] w-[4.5rem]",
  showShadow = true,
}: MishliHalfIllustrationProps) {
  return (
    <svg viewBox="0 0 64 132" className={className} aria-hidden>
      {showShadow && (
        <ellipse
          cx="32"
          cy="126"
          rx="24"
          ry="5"
          fill={MISHLI_INK}
          opacity="0.12"
        />
      )}
      <DrawHalf side={side} />
    </svg>
  );
}

/** Modal icon — static paired paths, cut faces forward, no rotate/scale collapse */
export function SplitMishliIllustration({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 148 96"
      className={`mx-auto h-[5.625rem] w-[8.75rem] ${className}`}
      aria-hidden
    >
      <ellipse cx="74" cy="12" rx="5" ry="3.5" fill={MISHLI_WET} opacity="0.75" />
      <ellipse cx="64" cy="18" rx="3" ry="2.2" fill="#B9D3CF" opacity="0.7" />
      <ellipse cx="84" cy="16" rx="2.8" ry="2" fill="#B9D3CF" opacity="0.65" />

      {/* Left half — cut face toward centre */}
      <g transform="translate(4 14)">
        <path
          d="M6 10 C4 36 8 78 26 98 C36 106 52 100 56 84 L56 12 C44 6 22 6 12 12 C8 14 6 10 6 10 Z"
          fill={MISHLI_GREEN_BASE}
          stroke={MISHLI_INK}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M12 16 C10 40 14 72 28 90 C36 96 48 92 52 78 L52 16 C40 12 22 14 12 16 Z"
          fill={MISHLI_GREEN_FIBRE}
          opacity="0.55"
        />
        <path
          d="M56 14 C44 18 38 38 38 58 C38 78 44 94 52 98 L56 98 L56 14 Z"
          fill={MISHLI_FLESH}
          stroke={MISHLI_INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M54 18 C52 42 52 68 54 92"
          fill="none"
          stroke={MISHLI_SHELL_EDGE}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <ellipse cx="46" cy="54" rx="8" ry="14" fill={MISHLI_WET} opacity="0.5" />
        <path
          d="M42 40 C44 54 43 68 45 80"
          stroke={MISHLI_FLESH_CREASE}
          strokeWidth="1.6"
          fill="none"
          opacity="0.7"
          strokeLinecap="round"
        />
      </g>

      {/* Right half — cut face toward centre */}
      <g transform="translate(78 14)">
        <path
          d="M58 10 C60 36 56 78 38 98 C28 106 12 100 8 84 L8 12 C20 6 42 6 52 12 C56 14 58 10 58 10 Z"
          fill={MISHLI_GREEN_BASE}
          stroke={MISHLI_INK}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M52 16 C54 40 50 72 36 90 C28 96 16 92 12 78 L12 16 C24 12 42 14 52 16 Z"
          fill={MISHLI_GREEN_FIBRE}
          opacity="0.55"
        />
        <path
          d="M8 14 C20 18 26 38 26 58 C26 78 20 94 12 98 L8 98 L8 14 Z"
          fill={MISHLI_FLESH}
          stroke={MISHLI_INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M10 18 C12 42 12 68 10 92"
          fill="none"
          stroke={MISHLI_SHELL_EDGE}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <ellipse cx="18" cy="54" rx="8" ry="14" fill={MISHLI_WET} opacity="0.5" />
        <path
          d="M22 40 C20 54 21 68 19 80"
          stroke={MISHLI_FLESH_CREASE}
          strokeWidth="1.6"
          fill="none"
          opacity="0.7"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
