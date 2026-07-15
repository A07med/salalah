"use client";

import { formatArabicPercent } from "@/lib/game/arabicNumerals";

interface CutProgressProps {
  progress: number;
}

export function CutProgress({ progress }: CutProgressProps) {
  const clamped = Math.min(100, Math.max(0, progress));
  const rounded = Math.round(clamped);

  return (
    <div className="stall-progress-unit mx-auto w-full min-w-[13.75rem] max-w-[16.25rem]">
      <div className="mb-1.5 flex items-baseline justify-between gap-3 px-0.5">
        <span className="text-sm font-bold text-stall-ink">نسبة القطع</span>
        <span
          data-qa="cut-progress-value"
          data-qa-progress-numeric={rounded}
          dir="ltr"
          className="font-display text-lg font-extrabold text-stall-red"
        >
          {formatArabicPercent(rounded)}
        </span>
      </div>
      <div
        data-qa="cut-progress-bar"
        className="h-5 overflow-hidden rounded-full border-[4px] border-stall-ink bg-stall-cream shadow-[4px_5px_0_#2D1C15]"
      >
        <div
          className="h-full rounded-full bg-stall-red transition-all duration-200 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
