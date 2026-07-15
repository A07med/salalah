import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDb } = vi.hoisted(() => ({ getDb: vi.fn() }));

vi.mock("@/db", () => ({ getDb }));

import { DuplicateSessionError, submitGameScore } from "./repository";
import type { ValidatedGameScore } from "./validation";

const result: ValidatedGameScore = {
  sessionId: "550e8400-e29b-41d4-a716-446655440000",
  playerName: "أحمد العبري",
  normalizedName: "أحمد العبري",
  score: 5960,
  levelReached: 4,
  successfulHits: 28,
  mistakes: 1,
  durationMs: 83_000,
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

  it("uses one atomic insert with conflict handling", async () => {
    const query = insertionReturning([{ sessionId: result.sessionId }]);

    await submitGameScore(result);

    expect(query.values).toHaveBeenCalledWith(result);
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
