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
}

export interface LeaderboardResponse {
  entries: GlobalLeaderboardEntry[];
}

export interface ScoreSubmissionResponse {
  saved: true;
  enteredTopFive: boolean;
}
