import {
  calculateDistanceFromCenter,
  getSwipeLength,
} from "./collision";
import { MIN_SWIPE_LENGTH } from "./constants";
import type { CutQuality, Point } from "./types";

/**
 * Tuned so Level 1 usually needs ~5–7 solid swipes to reach 100%.
 * Clean ~16–18%, edge ~12–14%, weak ~7–9%.
 */
export function calculateCutDamage(
  start: Point,
  end: Point,
  coconutRect: DOMRect,
  damageMultiplier: number,
): { damage: number; quality: CutQuality } {
  const length = getSwipeLength(start, end);

  if (length < MIN_SWIPE_LENGTH) {
    return { damage: 7 * damageMultiplier, quality: "weak" };
  }

  const mid: Point = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };

  const maxDist = Math.max(coconutRect.width, coconutRect.height) / 2;
  const dist = calculateDistanceFromCenter(mid, coconutRect);
  const proximity = 1 - Math.min(dist / maxDist, 1);
  const lengthFactor = Math.min(length / 140, 1);

  let damage = (9 + proximity * 12) * lengthFactor * damageMultiplier;
  let quality: CutQuality = "edge";

  if (proximity > 0.6 && length > 70) {
    damage = Math.max(damage, 17 * damageMultiplier);
    quality = "clean";
  } else if (proximity > 0.3) {
    damage = Math.max(damage, 13 * damageMultiplier);
    quality = "edge";
  } else {
    damage = Math.max(damage, 8 * damageMultiplier);
    quality = "weak";
  }

  return {
    damage: Math.round(damage * 10) / 10,
    quality,
  };
}

export function calculateSlashScore(
  damage: number,
  level: number,
  quality: CutQuality,
): number {
  let points = Math.round(damage * 10);
  points += level * 5;

  if (quality === "clean") points += 50;
  else if (quality === "edge") points += 15;

  return points;
}

export function calculateLevelCompleteBonus(level: number): number {
  return 100 + level * 50;
}

export function calculateMissPenalty(): number {
  return 20;
}
