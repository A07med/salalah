export interface GlobalLeaderboardEntry {
  playerName: string;
  score: number;
  levelReached: number;
}

export interface GameScoreSubmission {
  sessionId: string;
  playerName: string;
  score: number;
  levelReached: number;
  successfulHits: number;
  mistakes: number;
  durationMs: number;
  /** Authoritative per-fruit scores for a completed three-Mishli run. */
  attemptScores: [number, number, number];
}

export interface LeaderboardResponse {
  entries: GlobalLeaderboardEntry[];
}

export interface ScoreSubmissionResponse {
  saved: true;
  enteredTopFive: boolean;
}
