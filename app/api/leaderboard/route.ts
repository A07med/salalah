import { NextRequest, NextResponse } from "next/server";

import { DatabaseUnavailableError } from "@/db";
import { normalizePlayerName } from "@/lib/leaderboard/normalizePlayerName";
import {
  DuplicateSessionError,
  getGlobalLeaderboard,
  submitGameScore,
} from "@/lib/leaderboard/repository";
import { isScoreSubmissionRateLimited } from "@/lib/leaderboard/rateLimit";
import {
  validateLeaderboardLimit,
  validateScoreSubmission,
} from "@/lib/leaderboard/validation";

export const runtime = "nodejs";

function getRateLimitKey(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isDatabaseFailure(error: unknown): boolean {
  return (
    error instanceof DatabaseUnavailableError ||
    (error instanceof Error && "code" in error)
  );
}

export async function GET(request: NextRequest) {
  const limit = validateLeaderboardLimit(
    request.nextUrl.searchParams.get("limit"),
  );
  if (limit === null) {
    return NextResponse.json(
      { error: "INVALID_LEADERBOARD_LIMIT" },
      { status: 400 },
    );
  }

  try {
    const entries = await getGlobalLeaderboard(limit);

    return NextResponse.json(
      { entries },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "LEADERBOARD_UNAVAILABLE" },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (isScoreSubmissionRateLimited(getRateLimitKey(request))) {
    return NextResponse.json(
      { error: "RATE_LIMITED" },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_SCORE_SUBMISSION" },
      { status: 400 },
    );
  }

  const validated = validateScoreSubmission(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: validated.error },
      { status: 400 },
    );
  }

  try {
    await submitGameScore(validated.data);
  } catch (error) {
    if (error instanceof DuplicateSessionError) {
      return NextResponse.json(
        { error: "SESSION_ALREADY_SUBMITTED" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: isDatabaseFailure(error)
          ? "LEADERBOARD_UNAVAILABLE"
          : "UNEXPECTED_ERROR",
      },
      { status: isDatabaseFailure(error) ? 503 : 500 },
    );
  }

  let enteredTopFive = false;
  try {
    const topFive = await getGlobalLeaderboard(5);
    enteredTopFive = topFive.some(
      (entry) =>
        normalizePlayerName(entry.playerName).normalizedName ===
          validated.data.normalizedName &&
        entry.score === validated.data.score,
    );
  } catch {
    // The score is already durable; do not turn a successful write into a retry.
  }

  return NextResponse.json(
    { saved: true, enteredTopFive },
    { status: 201 },
  );
}
