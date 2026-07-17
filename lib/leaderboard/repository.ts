import "server-only";

import { asc, desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { mishliGameScores } from "@/db/schema";
import { CURRENT_SCORE_VERSION } from "@/lib/game/scoreVersion";

import type { GlobalLeaderboardEntry } from "./types";
import type { ValidatedGameScore } from "./validation";

export class DuplicateSessionError extends Error {
  constructor() {
    super("Game session has already been submitted");
    this.name = "DuplicateSessionError";
  }
}

export async function submitGameScore(
  result: ValidatedGameScore,
): Promise<void> {
  const inserted = await getDb()
    .insert(mishliGameScores)
    .values({
      sessionId: result.sessionId,
      playerName: result.playerName,
      normalizedName: result.normalizedName,
      score: result.score,
      levelReached: result.levelReached,
      successfulHits: result.successfulHits,
      mistakes: result.mistakes,
      durationMs: result.durationMs,
      scoreVersion: CURRENT_SCORE_VERSION,
    })
    .onConflictDoNothing({
      target: mishliGameScores.sessionId,
    })
    .returning({ sessionId: mishliGameScores.sessionId });

  if (inserted.length === 0) {
    throw new DuplicateSessionError();
  }
}

export async function hasSubmittedSession(
  sessionId: string,
): Promise<boolean> {
  const rows = await getDb()
    .select({ sessionId: mishliGameScores.sessionId })
    .from(mishliGameScores)
    .where(eq(mishliGameScores.sessionId, sessionId))
    .limit(1);

  return rows.length > 0;
}

export async function getGlobalLeaderboard(
  limit: number,
): Promise<GlobalLeaderboardEntry[]> {
  const database = getDb();
  const bestPerPlayer = database
    .selectDistinctOn([mishliGameScores.normalizedName], {
      playerName: mishliGameScores.playerName,
      normalizedName: mishliGameScores.normalizedName,
      score: mishliGameScores.score,
      levelReached: mishliGameScores.levelReached,
      createdAt: mishliGameScores.createdAt,
    })
    .from(mishliGameScores)
    .where(eq(mishliGameScores.scoreVersion, CURRENT_SCORE_VERSION))
    .orderBy(
      mishliGameScores.normalizedName,
      desc(mishliGameScores.score),
      asc(mishliGameScores.createdAt),
      asc(mishliGameScores.id),
    )
    .as("best_per_player");

  return database
    .select({
      playerName: bestPerPlayer.playerName,
      score: bestPerPlayer.score,
      levelReached: bestPerPlayer.levelReached,
    })
    .from(bestPerPlayer)
    .orderBy(
      desc(bestPerPlayer.score),
      asc(bestPerPlayer.createdAt),
      asc(bestPerPlayer.normalizedName),
    )
    .limit(limit);
}
