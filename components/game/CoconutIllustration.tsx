"use client";

import { MISHLI_BODY_PATH } from "./illustrations/mishliPaths";

interface CoconutIllustrationProps {
  cutProgress?: number;
  className?: string;
  idPrefix?: string;
  showHintSlash?: boolean;
  detached?: boolean;
  variant?: "default" | "sticker" | "table";
}

function getCutStage(progress: number): 0 | 1 | 2 | 3 | 4 {
  if (progress >= 100) return 4;
  if (progress >= 75) return 3;
  if (progress >= 50) return 2;
  if (progress >= 25) return 1;
  return 0;
}

const MISHLI_GREEN_BASE = "#6B8F3C";
const MISHLI_GREEN_LIGHT = "#8FAD56";
const MISHLI_GREEN_HIGHLIGHT = "#A8C878";
const MISHLI_GREEN_DEEP = "#4A6B32";

export function CoconutIllustration({
  cutProgress = 0,
  className = "w-28 h-32",
  idPrefix = "coco",
  showHintSlash = false,
  detached = false,
  variant = "default",
}: CoconutIllustrationProps) {
  const isSticker = variant === "sticker";
  const isTable = variant === "table";
  const crackId = `${idPrefix}-crack`;
  const stage = isTable ? 0 : getCutStage(cutProgress);

  if (isTable) {
    return (
      <svg viewBox="0 0 112 136" className={className} aria-hidden>
        {/* Contact shadow on board */}
        <ellipse cx="56" cy="128" rx="36" ry="7" fill="#2D1C15" opacity="0.14" />

        {/* Small natural top nub */}
        <ellipse
          cx="56"
          cy="17"
          rx="5"
          ry="3.5"
          fill={MISHLI_GREEN_DEEP}
          stroke="#2D1C15"
          strokeWidth="2"
        />

        <path
          d={MISHLI_BODY_PATH}
          fill={MISHLI_GREEN_BASE}
          stroke="#2D1C15"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        <ellipse cx="42" cy="52" rx="18" ry="14" fill={MISHLI_GREEN_LIGHT} opacity="0.42" />
        <path
          d="M68 44 C82 62 86 86 78 108 C72 88 66 64 68 44 Z"
          fill={MISHLI_GREEN_HIGHLIGHT}
          opacity="0.3"
        />

        <g stroke={MISHLI_GREEN_DEEP} strokeWidth="1.8" fill="none" opacity="0.48">
          <path d="M28 50 Q56 64 84 48" />
          <path d="M22 70 Q56 88 90 68" />
          <path d="M26 90 Q56 108 86 88" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 112 136" className={className} aria-hidden>
      <defs>
        <linearGradient id={crackId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8F0C8" />
          <stop offset="40%" stopColor="#D4E8A8" />
          <stop offset="100%" stopColor="#A8C878" />
        </linearGradient>
      </defs>

      {!detached && !isSticker && (
        <ellipse cx="56" cy="130" rx="28" ry="4" fill="rgba(0,0,0,0.18)" />
      )}

      {isSticker && (
        <ellipse cx="56" cy="128" rx="40" ry="8" fill="rgba(45,28,21,0.14)" />
      )}

      {/* Small clean green top nub — same language as table fruit */}
      {!detached && (
        <ellipse
          cx="56"
          cy="17"
          rx="5"
          ry="3.5"
          fill={MISHLI_GREEN_DEEP}
          stroke="#2D1C15"
          strokeWidth="2"
        />
      )}

      <path
        d={MISHLI_BODY_PATH}
        fill={MISHLI_GREEN_BASE}
        stroke="#2D1C15"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />

      <ellipse cx="42" cy="52" rx="18" ry="14" fill={MISHLI_GREEN_LIGHT} opacity="0.4" />
      <path
        d="M68 44 C82 62 86 86 78 108 C72 88 66 64 68 44 Z"
        fill={MISHLI_GREEN_HIGHLIGHT}
        opacity="0.28"
      />

      <g
        stroke={MISHLI_GREEN_DEEP}
        strokeWidth="1.8"
        fill="none"
        opacity="0.5"
      >
        <path d="M28 50 Q56 64 84 48" />
        <path d="M22 70 Q56 88 90 68" />
        <path d="M26 90 Q56 108 86 88" />
        <path d="M34 44 Q40 72 38 102" opacity="0.45" />
        <path d="M74 42 Q72 74 76 104" opacity="0.45" />
      </g>

      {stage >= 1 && (
        <g>
          <path
            d="M24 58 L88 72"
            stroke="#E8F0C8"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M26 60 L86 73"
            stroke={`url(#${crackId})`}
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>
      )}

      {stage >= 2 && (
        <g>
          <path
            d="M22 78 Q56 92 90 68"
            stroke="#E8F0C8"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
          <path d="M40 74 Q56 86 74 72" fill="#A8C878" opacity="0.45" />
          <path
            d="M36 76 L42 84 M50 80 L54 90 M66 76 L70 86"
            stroke="#D4E8A8"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
      )}

      {stage >= 3 && (
        <g>
          <path
            d="M28 98 L84 48"
            stroke="#FACC15"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.95"
          />
          <path
            d="M32 96 L80 52"
            stroke="#E8F0C8"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path d="M44 70 Q56 95 68 72" fill="#A8C878" opacity="0.4" />
          <circle cx="34" cy="66" r="1.6" fill={MISHLI_GREEN_LIGHT} opacity="0.9" />
          <circle cx="78" cy="80" r="1.4" fill={MISHLI_GREEN_BASE} opacity="0.85" />
          <circle cx="52" cy="98" r="1.2" fill="#FACC15" opacity="0.7" />
          <circle cx="70" cy="58" r="1.3" fill="#E8F0C8" opacity="0.6" />
        </g>
      )}

      {showHintSlash && (
        <path
          d="M26 72 L86 58"
          stroke="#EF3340"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="80"
          className="animate-hint-slash"
        />
      )}
    </svg>
  );
}

export { getCutStage };
