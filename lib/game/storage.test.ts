// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { STORAGE_KEYS } from "./constants";
import { getLocalBestScore, saveLocalBestScore } from "./storage";

describe("local best-score versioning", () => {
  it("does not surface legacy personal-best values in v2 mode", () => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEYS.bestScoreLegacy, "9000");

    expect(getLocalBestScore()).toBe(0);

    const best = saveLocalBestScore(2450);
    expect(best).toBe(2450);
    expect(localStorage.getItem(STORAGE_KEYS.bestScore)).toBe("2450");
    expect(localStorage.getItem(STORAGE_KEYS.bestScoreLegacy)).toBe("9000");
  });
});
