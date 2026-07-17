"use client";

import { toArabicNumeral } from "@/lib/game/arabicNumerals";

interface ScoreBoardProps {
  score: number;
}

export function ScoreBoard({ score }: ScoreBoardProps) {
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.round(score)) : 0;
  const digits = toArabicNumeral(safeScore);

  return (
    <div
      data-qa="score-board"
      className="stall-hud-card flex h-16 min-w-[5rem] flex-col items-center justify-center overflow-visible px-3 py-1.5"
    >
      <p className="flex h-4 shrink-0 items-center text-xs font-bold leading-4 text-stall-ink/70">
        النقاط
      </p>
      <p
        data-qa="score-value"
        className="mt-0.5 flex h-9 min-w-[1.75rem] items-center justify-center text-center text-[1.35rem] font-extrabold leading-9 tabular-nums tracking-wide text-stall-red [font-family:Arial,sans-serif]"
      >
        <bdi dir="ltr">{digits}</bdi>
      </p>
    </div>
  );
}
