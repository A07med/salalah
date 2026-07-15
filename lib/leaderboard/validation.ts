import { z } from "zod";

import {
  MAX_PLAYER_NAME_LENGTH,
  normalizePlayerName,
} from "./normalizePlayerName";
import type { GameScoreSubmission } from "./types";

const MAX_SCORE = 10_000_000;
const MAX_LEVEL = 1_000;
const MAX_POSTGRES_INTEGER = 2_147_483_647;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f]/u;
const HTML_MARKUP = /<[^>]*>/u;
const DEFAULT_LEADERBOARD_LIMIT = 5;

const leaderboardLimitSchema = z.coerce.number().int().min(1).max(10);

const scoreSubmissionSchema = z
  .object({
    sessionId: z.uuid(),
    playerName: z.string(),
    score: z.number().int().min(1).max(MAX_SCORE),
    levelReached: z.number().int().min(1).max(MAX_LEVEL),
    successfulHits: z.number().int().min(0).max(MAX_POSTGRES_INTEGER),
    mistakes: z.number().int().min(0).max(MAX_POSTGRES_INTEGER),
    durationMs: z.number().int().min(0).max(MAX_POSTGRES_INTEGER),
  })
  .strict();

export interface ValidatedGameScore extends GameScoreSubmission {
  normalizedName: string;
}

export type ScoreValidationResult =
  | { success: true; data: ValidatedGameScore }
  | { success: false; error: "INVALID_SCORE_SUBMISSION" };

export function validateLeaderboardLimit(
  value: string | null,
): number | null {
  if (value === null) return DEFAULT_LEADERBOARD_LIMIT;
  const parsed = leaderboardLimitSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function hasValidNameLength(name: string): boolean {
  const length = Array.from(name).length;
  return length >= 2 && length <= MAX_PLAYER_NAME_LENGTH;
}

/**
 * This is intentionally a broad sanity ceiling, not authoritative anti-cheat.
 * The browser still owns gameplay; signed/server-verified events are required
 * for a cheat-resistant leaderboard.
 */
function isPlausibleRun(result: GameScoreSubmission): boolean {
  if (result.score === 0 || result.successfulHits === 0) return false;

  const completedLevels = result.levelReached - 1;
  if (result.successfulHits < completedLevels) return false;
  if (result.mistakes > result.levelReached * 5) return false;

  const maximumLevelBonuses =
    completedLevels * 100 +
    25 * completedLevels * (completedLevels + 1);
  const generousMaximumScore =
    result.successfulHits * 5_250 + maximumLevelBonuses;

  if (result.score > generousMaximumScore) return false;

  const recordedActions = result.successfulHits + result.mistakes;
  return result.durationMs >= recordedActions * 30;
}

export function validateScoreSubmission(
  input: unknown,
): ScoreValidationResult {
  const parsed = scoreSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "INVALID_SCORE_SUBMISSION" };
  }

  const rawName = parsed.data.playerName;
  if (
    CONTROL_CHARACTERS.test(rawName) ||
    HTML_MARKUP.test(rawName)
  ) {
    return { success: false, error: "INVALID_SCORE_SUBMISSION" };
  }

  const { displayName, normalizedName } = normalizePlayerName(rawName);
  if (
    !hasValidNameLength(displayName) ||
    !hasValidNameLength(normalizedName) ||
    !isPlausibleRun(parsed.data)
  ) {
    return { success: false, error: "INVALID_SCORE_SUBMISSION" };
  }

  return {
    success: true,
    data: {
      ...parsed.data,
      playerName: displayName,
      normalizedName,
    },
  };
}
