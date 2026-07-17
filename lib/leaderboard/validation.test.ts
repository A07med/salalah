import { describe, expect, it } from "vitest";

import {
  validateLeaderboardLimit,
  validateScoreSubmission,
} from "./validation";

const validSubmission = {
  sessionId: "550e8400-e29b-41d4-a716-446655440000",
  playerName: "أحمد العبري",
  score: 2450,
  levelReached: 1 as const,
  successfulHits: 3,
  mistakes: 0,
  durationMs: 83_000,
  attemptScores: [875, 920, 655] as [number, number, number],
};

describe("validateScoreSubmission", () => {
  it("accepts and normalizes a valid v2 submission", () => {
    const result = validateScoreSubmission({
      ...validSubmission,
      playerName: "  Ahmed   ALI  ",
    });

    expect(result).toMatchObject({
      success: true,
      data: {
        playerName: "Ahmed ALI",
        normalizedName: "ahmed ali",
        scoreVersion: 2,
        score: 2450,
      },
    });
  });

  it.each([
    ["invalid UUID", { sessionId: "not-a-uuid" }],
    ["negative score", { score: -1 }],
    ["NaN score", { score: Number.NaN }],
    ["floating score", { score: 10.5 }],
    ["score above 3000", { score: 3001, attemptScores: [1000, 1000, 1000] }],
    ["negative hits", { successfulHits: -1 }],
    ["floating hits", { successfulHits: 1.5 }],
    ["negative mistakes", { mistakes: -1 }],
    ["floating mistakes", { mistakes: 1.5 }],
    ["floating duration", { durationMs: 1.5 }],
    ["non-literal level", { levelReached: 2 }],
    ["zero score", { score: 0, attemptScores: [0, 0, 0] }],
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

  it("rejects attempt-score sum mismatches", () => {
    expect(
      validateScoreSubmission({
        ...validSubmission,
        score: 2000,
        attemptScores: [875, 920, 655],
      }).success,
    ).toBe(false);
  });

  it("rejects scores above 1000 on a single attempt", () => {
    expect(
      validateScoreSubmission({
        ...validSubmission,
        score: 3000,
        attemptScores: [1001, 1000, 999],
        successfulHits: 3,
        mistakes: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects hit/miss counts that disagree with attempt scores", () => {
    expect(
      validateScoreSubmission({
        ...validSubmission,
        successfulHits: 2,
        mistakes: 1,
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
