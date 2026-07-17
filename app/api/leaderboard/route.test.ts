import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getGlobalLeaderboard: vi.fn(),
  submitGameScore: vi.fn(),
  isRateLimited: vi.fn(() => false),
}));

vi.mock("@/db", () => ({
  DatabaseUnavailableError: class DatabaseUnavailableError extends Error {},
}));

vi.mock("@/lib/leaderboard/repository", () => ({
  DuplicateSessionError: class DuplicateSessionError extends Error {},
  getGlobalLeaderboard: mocks.getGlobalLeaderboard,
  submitGameScore: mocks.submitGameScore,
}));

vi.mock("@/lib/leaderboard/rateLimit", () => ({
  isScoreSubmissionRateLimited: mocks.isRateLimited,
}));

import { DuplicateSessionError } from "@/lib/leaderboard/repository";
import { GET, POST } from "./route";

const submission = {
  sessionId: "550e8400-e29b-41d4-a716-446655440000",
  playerName: "أحمد العبري",
  score: 2450,
  levelReached: 1,
  successfulHits: 3,
  mistakes: 0,
  durationMs: 83_000,
  attemptScores: [875, 920, 655],
};

describe("/api/leaderboard", () => {
  beforeEach(() => {
    mocks.getGlobalLeaderboard.mockReset();
    mocks.submitGameScore.mockReset();
    mocks.isRateLimited.mockReset();
    mocks.isRateLimited.mockReturnValue(false);
  });

  it("rejects an impossible GET limit", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/leaderboard?limit=11"),
    );

    expect(response.status).toBe(400);
    expect(mocks.getGlobalLeaderboard).not.toHaveBeenCalled();
  });

  it("returns 409 for a duplicate session", async () => {
    mocks.submitGameScore.mockRejectedValue(new DuplicateSessionError());

    const response = await POST(
      new NextRequest("http://localhost/api/leaderboard", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(submission),
      }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "SESSION_ALREADY_SUBMITTED",
    });
  });

  it("returns 429 before processing a rate-limited submission", async () => {
    mocks.isRateLimited.mockReturnValue(true);

    const response = await POST(
      new NextRequest("http://localhost/api/leaderboard", {
        method: "POST",
        body: JSON.stringify(submission),
      }),
    );

    expect(response.status).toBe(429);
    expect(mocks.submitGameScore).not.toHaveBeenCalled();
  });
});
