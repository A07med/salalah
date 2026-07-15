import { STORAGE_KEYS } from "./constants";
import { MAX_PLAYER_NAME_LENGTH } from "@/lib/leaderboard/normalizePlayerName";

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  date: number;
}

const MAX_LEADERBOARD_ENTRIES = 5;
export function getLocalBestScore(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(STORAGE_KEYS.bestScore);
  return raw ? parseInt(raw, 10) : 0;
}

export function getLastScore(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(STORAGE_KEYS.lastScore);
  return raw ? parseInt(raw, 10) : 0;
}

export function saveLocalBestScore(score: number): number {
  if (typeof window === "undefined") return score;
  const current = getLocalBestScore();
  const best = Math.max(current, score);
  localStorage.setItem(STORAGE_KEYS.bestScore, String(best));
  localStorage.setItem(STORAGE_KEYS.lastScore, String(score));
  return best;
}

export function getPlayerName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEYS.playerName) ?? "";
}

export function savePlayerName(name: string): void {
  if (typeof window === "undefined") return;
  const trimmed = name.trim().slice(0, MAX_PLAYER_NAME_LENGTH);
  localStorage.setItem(STORAGE_KEYS.playerName, trimmed);
}

export function validatePlayerName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "اكتب اسمك عشان تبدأ";
  if (trimmed.length > MAX_PLAYER_NAME_LENGTH) {
    return `الاسم طويل — الحد الأقصى ${MAX_PLAYER_NAME_LENGTH} حرف`;
  }
  return null;
}

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEYS.leaderboard);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e) =>
          e &&
          typeof e.name === "string" &&
          typeof e.score === "number" &&
          typeof e.id === "string",
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_LEADERBOARD_ENTRIES);
  } catch {
    return [];
  }
}

export function addLeaderboardEntry(name: string, score: number): LeaderboardEntry[] {
  if (typeof window === "undefined" || score <= 0) return getLeaderboard();

  const trimmedName = name.trim().slice(0, MAX_PLAYER_NAME_LENGTH) || "لاعب";
  const current = getLeaderboard();
  const entry: LeaderboardEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: trimmedName,
    score,
    date: Date.now(),
  };

  const merged = [...current, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_LEADERBOARD_ENTRIES);

  localStorage.setItem(STORAGE_KEYS.leaderboard, JSON.stringify(merged));
  return merged;
}

export function recordSessionScore(name: string, score: number): LeaderboardEntry[] {
  if (score <= 0) return getLeaderboard();
  saveLocalBestScore(score);
  return addLeaderboardEntry(name, score);
}
