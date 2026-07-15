import type {
  GameScoreSubmission,
  ScoreSubmissionResponse,
} from "./types";

export type ScoreSubmitter = (
  result: GameScoreSubmission,
) => Promise<ScoreSubmissionResponse | null>;

export type GameRunEvent = "gameOver" | "exit" | "levelComplete";

export function shouldSubmitGameResult(
  event: GameRunEvent,
  score: number,
): boolean {
  return score > 0 && (event === "gameOver" || event === "exit");
}

async function postScore(
  result: GameScoreSubmission,
  fetchImpl: typeof fetch,
): Promise<Response> {
  return fetchImpl("/api/leaderboard", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  });
}

export async function submitGameScoreFromClient(
  result: GameScoreSubmission,
  fetchImpl: typeof fetch = fetch,
): Promise<ScoreSubmissionResponse | null> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await postScore(result, fetchImpl);

      if (response.status === 201) {
        return (await response.json()) as ScoreSubmissionResponse;
      }

      if (response.status < 500 || attempt === 1) {
        return null;
      }
    } catch {
      if (attempt === 1) return null;
    }
  }

  return null;
}

export async function submitGameResultOnce(
  result: GameScoreSubmission,
  submittedSessionIds: Set<string>,
  submitter: ScoreSubmitter = submitGameScoreFromClient,
): Promise<ScoreSubmissionResponse | null> {
  if (
    result.score <= 0 ||
    submittedSessionIds.has(result.sessionId)
  ) {
    return null;
  }

  submittedSessionIds.add(result.sessionId);
  try {
    return await submitter(result);
  } catch {
    return null;
  }
}
