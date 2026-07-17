import { z } from "zod";

import {
  ATTEMPTS_PER_RUN,
  CURRENT_SCORE_VERSION,
  MAX_FRUIT_SCORE,
  MAX_RUN_SCORE,
} from "@/lib/game/scoreVersion";
import {
  MAX_PLAYER_NAME_LENGTH,
  normalizePlayerName,
} from "./normalizePlayerName";
import type { GameScoreSubmission } from "./types";

const MAX_POSTGRES_INTEGER = 2_147_483_647;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f]/u;
const HTML_MARKUP = /<[^>]*>/u;
const DEFAULT_LEADERBOARD_LIMIT = 5;

const leaderboardLimitSchema = z.coerce.number().int().min(1).max(10);

const attemptScoreSchema = z.number().int().min(0).max(MAX_FRUIT_SCORE);

const scoreSubmissionSchema = z
  .object({
    sessionId: z.uuid(),
    playerName: z.string(),
    score: z.number().int().min(1).max(MAX_RUN_SCORE),
    levelReached: z.literal(1),
    successfulHits: z.number().int().min(0).max(ATTEMPTS_PER_RUN),
    mistakes: z.number().int().min(0).max(ATTEMPTS_PER_RUN),
    durationMs: z.number().int().min(0).max(MAX_POSTGRES_INTEGER),
    attemptScores: z.tuple([
      attemptScoreSchema,
      attemptScoreSchema,
      attemptScoreSchema,
    ]),
  })
  .strict();

export interface ValidatedGameScore extends GameScoreSubmission {
  normalizedName: string;
  scoreVersion: number;
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

function isValidV2Run(result: GameScoreSubmission): boolean {
  if (result.attemptScores.length !== ATTEMPTS_PER_RUN) return false;
  if (result.successfulHits + result.mistakes !== ATTEMPTS_PER_RUN) {
    return false;
  }

  const sum = result.attemptScores.reduce((total, value) => total + value, 0);
  if (sum !== result.score) return false;
  if (result.score > MAX_RUN_SCORE) return false;

  const hitsFromAttempts = result.attemptScores.filter(
    (value) => value > 0,
  ).length;
  const missesFromAttempts = result.attemptScores.filter(
    (value) => value === 0,
  ).length;

  if (hitsFromAttempts !== result.successfulHits) return false;
  if (missesFromAttempts !== result.mistakes) return false;

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
    !isValidV2Run(parsed.data)
  ) {
    return { success: false, error: "INVALID_SCORE_SUBMISSION" };
  }

  return {
    success: true,
    data: {
      ...parsed.data,
      playerName: displayName,
      normalizedName,
      scoreVersion: CURRENT_SCORE_VERSION,
    },
  };
}
