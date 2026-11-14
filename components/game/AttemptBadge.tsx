"use client";

import { toArabicNumeral } from "@/lib/game/arabicNumerals";
import { ATTEMPTS_PER_RUN } from "@/lib/game/scoreVersion";

interface AttemptBadgeProps {
  attemptIndex: 0 | 1 | 2;
}

export function AttemptBadge({ attemptIndex }: AttemptBadgeProps) {
  const current = attemptIndex + 1;
  return (
    <div
      data-qa="attempt-badge"
      className="stall-hud-card min-w-[6.5rem] px-3 py-1.5 text-center"
    >
      <p className="text-[10px] font-bold text-stall-ink/70">المحاولة</p>
      <p className="font-display text-base font-extrabold leading-tight text-stall-ink">
        المشلي{" "}
        <bdi dir="ltr">{toArabicNumeral(current)}</bdi> من{" "}
        <bdi dir="ltr">{toArabicNumeral(ATTEMPTS_PER_RUN)}</bdi>
      </p>
    </div>
  );
}
