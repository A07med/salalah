import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { like } from "drizzle-orm";

import { getDb } from "@/db";
import { mishliGameScores } from "@/db/schema";
import { CURRENT_SCORE_VERSION } from "@/lib/game/scoreVersion";

import { normalizePlayerName } from "./normalizePlayerName";
import {
  DuplicateSessionError,
  getGlobalLeaderboard,
  hasSubmittedSession,
  submitGameScore,
} from "./repository";
import type { ValidatedGameScore } from "./validation";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const integrationEnabled =
  Boolean(testDatabaseUrl) &&
  process.env.RUN_DB_INTEGRATION_TESTS === "1";
const qaRunPrefix = `qa${crypto.randomUUID().slice(0, 6)}`;

if (integrationEnabled) {
  process.env.DATABASE_URL = testDatabaseUrl;
}

async function deleteQaScores() {
  await getDb()
    .delete(mishliGameScores)
    .where(like(mishliGameScores.normalizedName, `${qaRunPrefix}%`));
}

function score(
  playerName: string,
  value: number,
): ValidatedGameScore {
  const { normalizedName } = normalizePlayerName(playerName);
  const clamped = Math.min(3000, Math.max(1, value));
  const a = Math.min(1000, clamped);
  const b = Math.min(1000, Math.max(0, clamped - a));
  const c = Math.min(1000, Math.max(0, clamped - a - b));
  const attemptScores: [number, number, number] = [a, b, c];
  const successfulHits = attemptScores.filter((entry) => entry > 0).length;
  return {
    sessionId: crypto.randomUUID(),
    playerName,
    normalizedName,
    score: a + b + c,
    levelReached: 1,
    successfulHits,
    mistakes: 3 - successfulHits,
    durationMs: 30_000,
    attemptScores,
    scoreVersion: CURRENT_SCORE_VERSION,
  };
}

describe.skipIf(!integrationEnabled)(
  "leaderboard repository (controlled PostgreSQL)",
  () => {
    beforeAll(async () => {
      await deleteQaScores();
    });

    afterAll(async () => {
      await deleteQaScores();
    });

    it("atomically inserts and detects duplicate sessions", async () => {
      const result = score(`${qaRunPrefix} duplicate`, 1000);
      await submitGameScore(result);
      await expect(hasSubmittedSession(result.sessionId)).resolves.toBe(true);
      await expect(submitGameScore(result)).rejects.toBeInstanceOf(
        DuplicateSessionError,
      );
    });

    it("selects each player's best version-2 score before applying global order", async () => {
      const playerA = `${qaRunPrefix} a`;
      const playerB = `${qaRunPrefix} b`;
      const playerC = `${qaRunPrefix} c`;
      const qaNames = new Set([playerA, playerB, playerC]);
      const a1000 = score(playerA, 2100);
      await submitGameScore(a1000);
      await submitGameScore(score(playerB, 2900));
      await submitGameScore(score(playerC, 2500));
      await submitGameScore(score(playerA.toUpperCase(), 1800));

      // Legacy version-1 row must not appear on the v2 leaderboard.
      await getDb().insert(mishliGameScores).values({
        sessionId: crypto.randomUUID(),
        playerName: `${qaRunPrefix} legacy`,
        normalizedName: `${qaRunPrefix} legacy`,
        score: 9_900_000,
        levelReached: 8,
        successfulHits: 40,
        mistakes: 1,
        durationMs: 90_000,
        scoreVersion: 1,
      });

      const firstResults = (await getGlobalLeaderboard(10)).filter((entry) =>
        qaNames.has(entry.playerName.toLowerCase()),
      );
      expect(firstResults).toEqual([
        { playerName: playerB, score: 2900, levelReached: 1 },
        { playerName: playerC, score: 2500, levelReached: 1 },
        { playerName: playerA, score: 2100, levelReached: 1 },
      ]);
      expect(
        (await getGlobalLeaderboard(10)).some((entry) =>
          entry.playerName.includes("legacy"),
        ),
      ).toBe(false);

      await submitGameScore(score(playerA.toUpperCase(), 3000));
      const updatedResults = (await getGlobalLeaderboard(10)).filter((entry) =>
        qaNames.has(entry.playerName.toLowerCase()),
      );
      expect(updatedResults).toEqual([
        {
          playerName: playerA.toUpperCase(),
          score: 3000,
          levelReached: 1,
        },
        { playerName: playerB, score: 2900, levelReached: 1 },
        { playerName: playerC, score: 2500, levelReached: 1 },
      ]);
    });

    it("keeps the earliest achievement when equal scores tie", async () => {
      const tiePlayer = `${qaRunPrefix} tie`;
      await submitGameScore(score(tiePlayer, 2400));
      await new Promise((resolve) => setTimeout(resolve, 5));
      await submitGameScore(score(tiePlayer.toUpperCase(), 2400));

      const tieResult = (await getGlobalLeaderboard(10)).find(
        (entry) => entry.playerName.toLowerCase() === tiePlayer,
      );
      expect(tieResult).toEqual({
        playerName: tiePlayer,
        score: 2400,
        levelReached: 1,
      });
    });
  },
);
