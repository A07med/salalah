import { describe, expect, it } from "vitest";

import {
  validateLeaderboardLimit,
  validateScoreSubmission,
} from "./validation";

const validSubmission = {
  sessionId: "550e8400-e29b-41d4-a716-446655440000",
  playerName: "أحمد العبري",
  score: 5960,
  levelReached: 4,
  successfulHits: 28,
  mistakes: 1,
  durationMs: 83_000,
};

describe("validateScoreSubmission", () => {
  it("accepts and normalizes a valid submission", () => {
    const result = validateScoreSubmission({
      ...validSubmission,
      playerName: "  Ahmed   ALI  ",
    });

    expect(result).toMatchObject({
      success: true,
      data: {
        playerName: "Ahmed ALI",
        normalizedName: "ahmed ali",
      },
    });
  });

  it.each([
    ["invalid UUID", { sessionId: "not-a-uuid" }],
    ["negative score", { score: -1 }],
    ["NaN score", { score: Number.NaN }],
    ["floating score", { score: 10.5 }],
    ["excessive score", { score: 10_000_001 }],
    ["negative hits", { successfulHits: -1 }],
    ["floating hits", { successfulHits: 1.5 }],
    ["negative mistakes", { mistakes: -1 }],
    ["floating mistakes", { mistakes: 1.5 }],
    ["floating duration", { durationMs: 1.5 }],
    ["excessive level", { levelReached: 1_001 }],
    ["floating level", { levelReached: 1.5 }],
    ["zero score", { score: 0 }],
    ["empty name", { playerName: "   " }],
    ["overlong name", { playerName: "أ".repeat(21) }],
  ])("rejects %s", (_label, patch) => {
    expect(
      validateScoreSubmission({ ...validSubmission, ...patch }).success,
    ).toBe(false);
  });

  it("rejects unexpected request fields", () => {
    expect(
      validateScoreSubmission({
        ...validSubmission,
        admin: true,
      }).success,
    ).toBe(false);
  });

  it("rejects markup and control characters in names", () => {
    expect(
      validateScoreSubmission({
        ...validSubmission,
        playerName: "<b>أحمد</b>",
      }).success,
    ).toBe(false);
    expect(
      validateScoreSubmission({
        ...validSubmission,
        playerName: "أحمد\u0000",
      }).success,
    ).toBe(false);
  });

  it("rejects obviously impossible score telemetry", () => {
    expect(
      validateScoreSubmission({
        ...validSubmission,
        score: 1_000_000,
        successfulHits: 1,
        levelReached: 1,
      }).success,
    ).toBe(false);
  });

  it("accepts a 20-character display name", () => {
    expect(
      validateScoreSubmission({
        ...validSubmission,
        playerName: "أ".repeat(20),
      }).success,
    ).toBe(true);
  });
});

describe("validateLeaderboardLimit", () => {
  it("defaults to five and accepts the configured range", () => {
    expect(validateLeaderboardLimit(null)).toBe(5);
    expect(validateLeaderboardLimit("1")).toBe(1);
    expect(validateLeaderboardLimit("10")).toBe(10);
  });

  it.each(["0", "-1", "11", "1.5", "nope", ""])(
    "rejects impossible limit %s",
    (value) => {
      expect(validateLeaderboardLimit(value)).toBeNull();
    },
  );
});
