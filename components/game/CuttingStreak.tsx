"use client";

import type { Point } from "@/lib/game/types";

interface CuttingStreakProps {
  origin: Point | null;
  angle: number;
  streakKey: number;
  visible: boolean;
}

export function CuttingStreak({
  origin,
  angle,
  streakKey,
  visible,
}: CuttingStreakProps) {
  if (!visible || !origin) return null;

  const length = 48;

  return (
    <svg
      key={streakKey}
      className="pointer-events-none absolute inset-0 z-[26] h-full w-full animate-cutting-streak"
      aria-hidden
    >
      <line
        x1={origin.x - Math.cos((angle * Math.PI) / 180) * (length / 2)}
        y1={origin.y - Math.sin((angle * Math.PI) / 180) * (length / 2)}
        x2={origin.x + Math.cos((angle * Math.PI) / 180) * (length / 2)}
        y2={origin.y + Math.sin((angle * Math.PI) / 180) * (length / 2)}
        stroke="#FFF8E7"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1={origin.x - Math.cos((angle * Math.PI) / 180) * (length / 2)}
        y1={origin.y - Math.sin((angle * Math.PI) / 180) * (length / 2)}
        x2={origin.x + Math.cos((angle * Math.PI) / 180) * (length / 2)}
        y2={origin.y + Math.sin((angle * Math.PI) / 180) * (length / 2)}
        stroke="#2D1C15"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
