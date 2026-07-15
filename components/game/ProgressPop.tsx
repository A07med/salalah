"use client";

import { formatArabicPlusPercent } from "@/lib/game/arabicNumerals";

interface ProgressPopProps {
  amount: number;
  visible: boolean;
  popKey: number;
  anchor: { x: number; y: number } | null;
}

export function ProgressPop({
  amount,
  visible,
  popKey,
  anchor,
}: ProgressPopProps) {
  if (!visible || amount <= 0 || !anchor) return null;

  return (
    <div
      key={popKey}
      data-qa="progress-pop"
      className="pointer-events-none absolute z-[35] animate-fruit-score-pop"
      style={{ left: anchor.x, top: anchor.y }}
    >
      <span
        dir="ltr"
        data-qa="progress-pop-value"
        className="block font-display text-[19px] font-extrabold leading-[19px]"
        style={{
          color: "#FFF8E7",
          textShadow: "3px 3px 0 #2D1C15",
          opacity: 1,
        }}
      >
        {formatArabicPlusPercent(amount)}
      </span>
    </div>
  );
}
