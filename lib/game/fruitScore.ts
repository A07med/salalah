import { getSwipeLength, lineIntersectsRect } from "./collision";
import { clamp01, swipeAngleDeg } from "./coordinates";
import type { CutTarget } from "./cutTargets";
import {
  ANGLE_SCORE_WEIGHT,
  COVERAGE_SCORE_WEIGHT,
  MAX_FRUIT_SCORE,
  POSITION_SCORE_WEIGHT,
} from "./scoreVersion";
import type { Point } from "./types";

export interface FruitScoreInput {
  start: Point;
  end: Point;
  fruitRect: DOMRect;
  target: CutTarget;
  impactPoint: Point | null;
  hit: boolean;
}

export interface FruitScoreBreakdown {
  score: number;
  positionAccuracy: number;
  angleAccuracy: number;
  cutCoverage: number;
}

/** Smallest angular difference for undirected cut lines (mod 180°). */
export function smallestCutAngleDifference(
  aDeg: number,
  bDeg: number,
): number {
  const normalize = (deg: number) => {
    const mod = ((deg % 180) + 180) % 180;
    return mod;
  };
  let diff = Math.abs(normalize(aDeg) - normalize(bDeg));
  if (diff > 90) diff = 180 - diff;
  return diff;
}

function targetPoint(rect: DOMRect, target: CutTarget): Point {
  return {
    x: rect.left + target.nx * rect.width,
    y: rect.top + target.ny * rect.height,
  };
}

/** Perpendicular distance from a point to the infinite ideal cut line. */
export function perpendicularDistanceToCutLine(
  point: Point,
  rect: DOMRect,
  target: CutTarget,
): number {
  const origin = targetPoint(rect, target);
  const rad = (target.angleDeg * Math.PI) / 180;
  const dirX = Math.cos(rad);
  const dirY = Math.sin(rad);
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  return Math.abs(dx * dirY - dy * dirX);
}

/**
 * Allowed miss distance scales with fruit size (half the axis
 * perpendicular to the cut), so phone and desktop score equivalently.
 */
export function allowedPositionDistance(
  rect: DOMRect,
  target: CutTarget,
): number {
  const rad = (target.angleDeg * Math.PI) / 180;
  const perpendicularSpan =
    Math.abs(Math.sin(rad)) * rect.width +
    Math.abs(Math.cos(rad)) * rect.height;
  return Math.max(perpendicularSpan * 0.45, 1);
}

/**
 * Required cut length scales with fruit size along the ideal direction.
 */
export function requiredCutLength(rect: DOMRect, target: CutTarget): number {
  const rad = (target.angleDeg * Math.PI) / 180;
  const alongSpan =
    Math.abs(Math.cos(rad)) * rect.width +
    Math.abs(Math.sin(rad)) * rect.height;
  return Math.max(alongSpan * 0.55, 1);
}

function clipParam(
  start: Point,
  end: Point,
  edgeValue: number,
  horizontal: boolean,
): number | null {
  const a = horizontal ? start.x : start.y;
  const b = horizontal ? end.x : end.y;
  const delta = b - a;
  if (Math.abs(delta) < 1e-9) return null;
  const t = (edgeValue - a) / delta;
  if (t < -0.001 || t > 1.001) return null;
  return Math.min(1, Math.max(0, t));
}

/** Length of the swipe segment that lies inside the fruit rectangle. */
export function lengthInsideFruit(
  start: Point,
  end: Point,
  rect: DOMRect,
): number {
  if (!lineIntersectsRect(start, end, rect)) return 0;

  const total = getSwipeLength(start, end);
  if (total < 1e-6) return 0;

  const ts: number[] = [];
  const push = (t: number | null) => {
    if (t === null) return;
    const x = start.x + (end.x - start.x) * t;
    const y = start.y + (end.y - start.y) * t;
    if (
      x >= rect.left - 0.5 &&
      x <= rect.right + 0.5 &&
      y >= rect.top - 0.5 &&
      y <= rect.bottom + 0.5
    ) {
      ts.push(t);
    }
  };

  push(clipParam(start, end, rect.left, true));
  push(clipParam(start, end, rect.right, true));
  push(clipParam(start, end, rect.top, false));
  push(clipParam(start, end, rect.bottom, false));

  const inside = (p: Point) =>
    p.x >= rect.left &&
    p.x <= rect.right &&
    p.y >= rect.top &&
    p.y <= rect.bottom;

  if (inside(start)) ts.push(0);
  if (inside(end)) ts.push(1);

  if (ts.length === 0) return 0;

  const tMin = Math.min(...ts);
  const tMax = Math.max(...ts);
  return total * (tMax - tMin);
}

export function calculateFruitScore(
  input: FruitScoreInput,
): FruitScoreBreakdown {
  if (!input.hit) {
    return {
      score: 0,
      positionAccuracy: 0,
      angleAccuracy: 0,
      cutCoverage: 0,
    };
  }

  const impact =
    input.impactPoint ?? {
      x: (input.start.x + input.end.x) / 2,
      y: (input.start.y + input.end.y) / 2,
    };

  const allowed = allowedPositionDistance(input.fruitRect, input.target);
  const distance = perpendicularDistanceToCutLine(
    impact,
    input.fruitRect,
    input.target,
  );
  const positionAccuracy = clamp01(1 - distance / allowed);

  const swipeAngle = swipeAngleDeg(input.start, input.end);
  const angleDiff = smallestCutAngleDifference(
    swipeAngle,
    input.target.angleDeg,
  );
  const angleAccuracy = clamp01(1 - angleDiff / 45);

  const inside = lengthInsideFruit(
    input.start,
    input.end,
    input.fruitRect,
  );
  const required = requiredCutLength(input.fruitRect, input.target);
  const cutCoverage = clamp01(inside / required);

  const raw =
    positionAccuracy * POSITION_SCORE_WEIGHT +
    angleAccuracy * ANGLE_SCORE_WEIGHT +
    cutCoverage * COVERAGE_SCORE_WEIGHT;

  const score = Math.min(
    MAX_FRUIT_SCORE,
    Math.max(0, Math.round(raw)),
  );

  return {
    score,
    positionAccuracy,
    angleAccuracy,
    cutCoverage,
  };
}

export function getQualityLabel(score: number): string {
  if (score >= 950) return "قطع مثالي!";
  if (score >= 800) return "ممتاز!";
  if (score >= 600) return "قطع جيد";
  if (score >= 400) return "قريب";
  if (score >= 1) return "بعيد عن العلامة";
  return "ما صابت!";
}

export function sumAttemptScores(attemptScores: number[]): number {
  return attemptScores.reduce((sum, value) => sum + value, 0);
}
