import { describe, expect, it } from "vitest";

import { normalizePlayerName } from "./normalizePlayerName";

describe("normalizePlayerName", () => {
  it("preserves a correctly displayed Arabic name", () => {
    expect(normalizePlayerName("أحمد العبري")).toEqual({
      displayName: "أحمد العبري",
      normalizedName: "أحمد العبري",
    });
  });

  it("lowercases Latin characters for comparison", () => {
    expect(normalizePlayerName("Ahmed ALI")).toEqual({
      displayName: "Ahmed ALI",
      normalizedName: "ahmed ali",
    });
  });

  it("trims and collapses repeated whitespace", () => {
    expect(normalizePlayerName("  أحمد   بن   علي  ")).toEqual({
      displayName: "أحمد بن علي",
      normalizedName: "أحمد بن علي",
    });
  });

  it("removes Arabic tatweel only from the comparison name", () => {
    expect(normalizePlayerName("أحــمد")).toEqual({
      displayName: "أحــمد",
      normalizedName: "أحمد",
    });
  });

  it("returns an empty normalized value for whitespace-only input", () => {
    expect(normalizePlayerName("   ")).toEqual({
      displayName: "",
      normalizedName: "",
    });
  });

  it("does not silently truncate at the 20-character validation boundary", () => {
    const name = "أ".repeat(20);
    expect(normalizePlayerName(name).displayName).toBe(name);
  });
});
