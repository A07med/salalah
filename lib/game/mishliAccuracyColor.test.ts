import { describe, expect, it } from "vitest";

import {
  getMishliAccuracyColor,
  interpolateRgb,
  PERFECT_MISHLI_GREEN,
  WEAK_MISHLI_GREEN,
} from "@/lib/game/mishliAccuracyColor";

describe("mishliAccuracyColor", () => {
  it("clamps values below 0 and above 1000", () => {
    expect(getMishliAccuracyColor(-50)).toBe(getMishliAccuracyColor(0));
    expect(getMishliAccuracyColor(1500)).toBe(getMishliAccuracyColor(1000));
  });

  it("uses pale green for a low score", () => {
    const pale = getMishliAccuracyColor(200);
    expect(pale.toLowerCase()).not.toBe(PERFECT_MISHLI_GREEN.toLowerCase());
    // Closer to weak than perfect
    const [wr] = [parseInt(WEAK_MISHLI_GREEN.slice(1, 3), 16)];
    const [pr] = [parseInt(PERFECT_MISHLI_GREEN.slice(1, 3), 16)];
    const r = parseInt(pale.slice(1, 3), 16);
    expect(Math.abs(r - wr)).toBeLessThan(Math.abs(r - pr));
  });

  it("uses the original Mishli green for a perfect score", () => {
    expect(getMishliAccuracyColor(1000).toLowerCase()).toBe(
      PERFECT_MISHLI_GREEN.toLowerCase(),
    );
  });

  it("interpolates deterministically at midpoints", () => {
    expect(interpolateRgb("#000000", "#FFFFFF", 0.5).toLowerCase()).toBe(
      "#808080",
    );
  });

  it("reports expected colours for 200/500/800/1000", () => {
    expect(getMishliAccuracyColor(200)).toBe(
      interpolateRgb(WEAK_MISHLI_GREEN, PERFECT_MISHLI_GREEN, 0.2),
    );
    expect(getMishliAccuracyColor(500)).toBe(
      interpolateRgb(WEAK_MISHLI_GREEN, PERFECT_MISHLI_GREEN, 0.5),
    );
    expect(getMishliAccuracyColor(800)).toBe(
      interpolateRgb(WEAK_MISHLI_GREEN, PERFECT_MISHLI_GREEN, 0.8),
    );
    expect(getMishliAccuracyColor(1000).toUpperCase()).toBe(
      PERFECT_MISHLI_GREEN.toUpperCase(),
    );
  });
});
