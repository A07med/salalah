import {
  calculateDistanceFromCenter,
  getSwipeLength,
} from "./collision";
import { MIN_SWIPE_LENGTH } from "./constants";
import type { Point } from "./types";

/** @deprecated Legacy multi-hit quality label — retained for collision QA scripts. */
type LegacyCutQuality = "clean" | "edge" | "weak" | "miss";

/**
 * @deprecated Prefer `calculateFruitScore` for the three-Mishli run.
 * Kept for offline collision QA scripts that still probe damage geometry.
 */
export function calculateCutDamage(
  start: Point,
  end: Point,
  coconutRect: DOMRect,
  damageMultiplier: number,
): { damage: number; quality: LegacyCutQuality } {
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
  let quality: LegacyCutQuality = "edge";

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
