"use client";

import { formatArabicPlusPoints, toArabicNumeral } from "@/lib/game/arabicNumerals";

interface AttemptScorePopProps {
  score: number;
  label: string;
  visible: boolean;
  popKey: number;
  anchor: { x: number; y: number } | null;
}

export function AttemptScorePop({
  score,
  label,
  visible,
  popKey,
  anchor,
}: AttemptScorePopProps) {
  if (!visible || !anchor) return null;

  return (
    <div
      key={popKey}
      data-qa="attempt-score-pop"
      className="pointer-events-none absolute z-[35] animate-fruit-score-pop"
      style={{ left: anchor.x, top: anchor.y }}
    >
      <div className="-translate-x-1/2 -translate-y-full text-center">
        <div
          className="rounded-xl border-[3px] border-stall-ink px-3 py-1.5"
          style={{
            background: "rgba(255, 248, 231, 0.94)",
            boxShadow: "3px 3px 0 #2D1C15",
          }}
        >
          <span
            dir="ltr"
            data-qa="attempt-score-value"
            className="block font-display text-[19px] font-extrabold leading-tight text-stall-ink"
          >
            {score > 0
              ? formatArabicPlusPoints(score)
              : `${toArabicNumeral(0)} نقطة`}
          </span>
          <span
            data-qa="attempt-score-label"
            className="mt-0.5 block font-display text-sm font-extrabold text-stall-red"
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
