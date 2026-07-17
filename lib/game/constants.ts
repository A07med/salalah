export const STORAGE_KEYS = {
  /** Legacy multi-hit personal best — retained but unused by v2 mode. */
  bestScoreLegacy: "khareef_best_score",
  /** Three-Mishli one-swipe personal best (max 3000). */
  bestScore: "khareef_best_score_v2",
  lastScore: "khareef_last_score_v2",
  playerName: "khareef_player_name",
  leaderboard: "khareef_leaderboard",
} as const;

export const MIN_SWIPE_LENGTH = 20;
export const SLASH_FADE_MS = 400;
export const DROP_DURATION_MS = 800;
