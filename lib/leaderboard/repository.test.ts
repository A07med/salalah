import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDb } = vi.hoisted(() => ({ getDb: vi.fn() }));

vi.mock("@/db", () => ({ getDb }));

import { CURRENT_SCORE_VERSION } from "@/lib/game/scoreVersion";
import { DuplicateSessionError, submitGameScore } from "./repository";
import type { ValidatedGameScore } from "./validation";

const result: ValidatedGameScore = {
  sessionId: "550e8400-e29b-41d4-a716-446655440000",
  playerName: "أحمد العبري",
  normalizedName: "أحمد العبري",
  score: 2450,
  levelReached: 1,
  successfulHits: 3,
  mistakes: 0,
  durationMs: 83_000,
  attemptScores: [875, 920, 655],
  scoreVersion: CURRENT_SCORE_VERSION,
};

function insertionReturning(rows: { sessionId: string }[]) {
  const returning = vi.fn().mockResolvedValue(rows);
  const onConflictDoNothing = vi.fn(() => ({ returning }));
  const values = vi.fn(() => ({ onConflictDoNothing }));
  const insert = vi.fn(() => ({ values }));
  getDb.mockReturnValue({ insert });

  return { insert, values, onConflictDoNothing, returning };
}

describe("submitGameScore", () => {
  beforeEach(() => {
    getDb.mockReset();
  });

  it("uses one atomic insert with conflict handling and server score version", async () => {
    const query = insertionReturning([{ sessionId: result.sessionId }]);

    await submitGameScore(result);

    expect(query.values).toHaveBeenCalledWith({
      sessionId: result.sessionId,
      playerName: result.playerName,
      normalizedName: result.normalizedName,
      score: result.score,
      levelReached: 1,
      successfulHits: 3,
      mistakes: 0,
      durationMs: 83_000,
      scoreVersion: CURRENT_SCORE_VERSION,
    });
    expect(query.onConflictDoNothing).toHaveBeenCalledOnce();
    expect(query.returning).toHaveBeenCalledOnce();
  });

  it("reports a duplicate when the atomic insert returns no row", async () => {
    insertionReturning([]);

    await expect(submitGameScore(result)).rejects.toBeInstanceOf(
      DuplicateSessionError,
    );
  });
});
