import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { like } from "drizzle-orm";

import { getDb } from "@/db";
import { mishliGameScores } from "@/db/schema";

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
  return {
    sessionId: crypto.randomUUID(),
    playerName,
    normalizedName,
    score: value,
    levelReached: 2,
    successfulHits: 10,
    mistakes: 1,
    durationMs: 30_000,
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

    it("selects each player's best score before applying global order and limit", async () => {
      const playerA = `${qaRunPrefix} a`;
      const playerB = `${qaRunPrefix} b`;
      const playerC = `${qaRunPrefix} c`;
      const qaNames = new Set([playerA, playerB, playerC]);
      const a1000 = score(playerA, 9_900_100);
      await submitGameScore(a1000);
      await submitGameScore(score(playerB, 9_900_300));
      await submitGameScore(score(playerC, 9_900_200));
      await submitGameScore(score(playerA.toUpperCase(), 9_900_050));

      const firstResults = (await getGlobalLeaderboard(10)).filter((entry) =>
        qaNames.has(entry.playerName.toLowerCase()),
      );
      expect(firstResults).toEqual([
        { playerName: playerB, score: 9_900_300, levelReached: 2 },
        { playerName: playerC, score: 9_900_200, levelReached: 2 },
        { playerName: playerA, score: 9_900_100, levelReached: 2 },
      ]);

      await submitGameScore(score(playerA.toUpperCase(), 9_900_400));
      const updatedResults = (await getGlobalLeaderboard(10)).filter((entry) =>
        qaNames.has(entry.playerName.toLowerCase()),
      );
      expect(updatedResults).toEqual([
        {
          playerName: playerA.toUpperCase(),
          score: 9_900_400,
          levelReached: 2,
        },
        { playerName: playerB, score: 9_900_300, levelReached: 2 },
        { playerName: playerC, score: 9_900_200, levelReached: 2 },
      ]);
    });

    it("keeps the earliest achievement when equal scores tie", async () => {
      const tiePlayer = `${qaRunPrefix} tie`;
      await submitGameScore(score(tiePlayer, 9_900_250));
      await new Promise((resolve) => setTimeout(resolve, 5));
      await submitGameScore(score(tiePlayer.toUpperCase(), 9_900_250));

      const tieResult = (await getGlobalLeaderboard(10)).find(
        (entry) => entry.playerName.toLowerCase() === tiePlayer,
      );
      expect(tieResult).toEqual({
        playerName: tiePlayer,
        score: 9_900_250,
        levelReached: 2,
      });
    });
  },
);
