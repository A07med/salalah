"use client";

import { AttemptMishliIndicator } from "./AttemptMishliIndicator";
import type { AttemptIndex } from "@/lib/game/types";

interface AttemptCutsCardProps {
  attemptScores: number[];
  activeAttempt: AttemptIndex;
  phase: string;
}

export function AttemptCutsCard({
  attemptScores,
  activeAttempt,
  phase,
}: AttemptCutsCardProps) {
  return (
    <div
      data-qa="attempt-cuts-card"
      className="stall-hud-card flex h-16 min-w-[7.5rem] flex-col items-center justify-center overflow-visible px-3 py-1.5"
    >
      <p
        dir="rtl"
        data-qa="attempt-cuts-label"
        className="flex h-4 shrink-0 items-center text-xs font-bold leading-4 text-stall-ink/70"
      >
        القصات
      </p>
      <div dir="ltr" className="mt-0.5 flex h-9 items-center">
        <AttemptMishliIndicator
          attemptScores={attemptScores}
          activeAttempt={activeAttempt}
          phase={phase}
        />
      </div>
    </div>
  );
}
