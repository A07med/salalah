import { describe, expect, it } from "vitest";

import {
  calculateFruitScore,
  lengthInsideFruit,
  smallestCutAngleDifference,
  sumAttemptScores,
} from "./fruitScore";
import { FRUIT_TARGETS } from "./cutTargets";
import { MAX_FRUIT_SCORE, MAX_RUN_SCORE } from "./scoreVersion";

function rect(width = 100, height = 120): DOMRect {
  return {
    left: 0,
    top: 0,
    right: width,
    bottom: height,
    width,
    height,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect;
}

describe("fruitScore", () => {
  const target = FRUIT_TARGETS[0];
  const fruit = rect();

  it("returns 1000 for a perfect target hit", () => {
    const start = { x: -10, y: 60 };
    const end = { x: 110, y: 60 };
    const impact = { x: 50, y: 60 };

    const result = calculateFruitScore({
      start,
      end,
      fruitRect: fruit,
      target,
      impactPoint: impact,
      hit: true,
    });

    expect(result.score).toBe(MAX_FRUIT_SCORE);
    expect(result.positionAccuracy).toBeCloseTo(1, 5);
    expect(result.angleAccuracy).toBeCloseTo(1, 5);
    expect(result.cutCoverage).toBeGreaterThan(0.9);
  });

  it("preserves the angle score when the swipe direction is reversed", () => {
    const forward = calculateFruitScore({
      start: { x: 0, y: 60 },
      end: { x: 100, y: 60 },
      fruitRect: fruit,
      target,
      impactPoint: { x: 50, y: 60 },
      hit: true,
    });
    const reverse = calculateFruitScore({
      start: { x: 100, y: 60 },
      end: { x: 0, y: 60 },
      fruitRect: fruit,
      target,
      impactPoint: { x: 50, y: 60 },
      hit: true,
    });

    expect(forward.angleAccuracy).toBeCloseTo(reverse.angleAccuracy, 5);
    expect(smallestCutAngleDifference(0, 180)).toBe(0);
  });

  it("reduces only the angle component for a wrong angle", () => {
    const result = calculateFruitScore({
      start: { x: 50, y: 0 },
      end: { x: 50, y: 120 },
      fruitRect: fruit,
      target,
      impactPoint: { x: 50, y: 60 },
      hit: true,
    });

    expect(result.positionAccuracy).toBeGreaterThan(0.9);
    expect(result.angleAccuracy).toBeLessThan(0.2);
    expect(result.score).toBeLessThan(MAX_FRUIT_SCORE);
  });

  it("reduces the position component for an offset impact", () => {
    const result = calculateFruitScore({
      start: { x: 0, y: 20 },
      end: { x: 100, y: 20 },
      fruitRect: fruit,
      target,
      impactPoint: { x: 50, y: 20 },
      hit: true,
    });

    expect(result.positionAccuracy).toBeLessThan(0.7);
    expect(result.angleAccuracy).toBeCloseTo(1, 5);
  });

  it("reduces coverage for a short fruit intersection", () => {
    const short = lengthInsideFruit(
      { x: 45, y: 60 },
      { x: 55, y: 60 },
      fruit,
    );
    const long = lengthInsideFruit(
      { x: -10, y: 60 },
      { x: 110, y: 60 },
      fruit,
    );
    expect(short).toBeLessThan(long);

    const result = calculateFruitScore({
      start: { x: 45, y: 60 },
      end: { x: 55, y: 60 },
      fruitRect: fruit,
      target,
      impactPoint: { x: 50, y: 60 },
      hit: true,
    });
    expect(result.cutCoverage).toBeLessThan(0.5);
  });

  it("returns 0 for a miss", () => {
    expect(
      calculateFruitScore({
        start: { x: 0, y: 0 },
        end: { x: 10, y: 0 },
        fruitRect: fruit,
        target,
        impactPoint: null,
        hit: false,
      }).score,
    ).toBe(0);
  });

  it("always clamps the result from 0 to 1000", () => {
    const result = calculateFruitScore({
      start: { x: -100, y: 60 },
      end: { x: 200, y: 60 },
      fruitRect: fruit,
      target,
      impactPoint: { x: 50, y: 60 },
      hit: true,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(MAX_FRUIT_SCORE);
  });

  it("sums three results to a maximum of 3000", () => {
    expect(sumAttemptScores([1000, 1000, 1000])).toBe(MAX_RUN_SCORE);
    expect(sumAttemptScores([875, 920, 655])).toBe(2450);
  });

  it("produces equal scores for equivalent normalized mouse and touch gestures", () => {
    const gesture = {
      start: { x: 0, y: 60 },
      end: { x: 100, y: 60 },
      fruitRect: fruit,
      target,
      impactPoint: { x: 50, y: 60 },
      hit: true as const,
    };
    const mouse = calculateFruitScore(gesture);
    const touch = calculateFruitScore({ ...gesture });
    expect(mouse).toEqual(touch);
  });
});
