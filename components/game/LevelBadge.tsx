"use client";

import { toArabicNumeral } from "@/lib/game/arabicNumerals";

interface LevelBadgeProps {
  level: number;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <div className="stall-level-banner px-4 py-1.5">
      <span className="font-display text-sm font-bold text-stall-cream">
        المستوى {toArabicNumeral(level)}
      </span>
    </div>
  );
}
