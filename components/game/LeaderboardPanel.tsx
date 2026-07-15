import { toArabicNumeral } from "@/lib/game/arabicNumerals";
import type { GlobalLeaderboardEntry } from "@/lib/leaderboard/types";
import { TrophySticker } from "./illustrations/TrophySticker";

interface LeaderboardPanelProps {
  entries: GlobalLeaderboardEntry[];
  status: "loading" | "success" | "error";
  onRetry?: () => void;
  className?: string;
}

export function LeaderboardPanel({
  entries,
  status,
  onRetry,
  className = "",
}: LeaderboardPanelProps) {
  return (
    <div
      className={`game-surface min-h-[8.75rem] w-full px-3 py-3.5 sm:px-4 sm:py-4 ${className}`}
    >
      <div className="flex items-center justify-center gap-2 overflow-hidden">
        <TrophySticker className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
        <h2 className="whitespace-nowrap font-display text-base font-extrabold text-game-ink sm:text-lg">
          أفضل القصاصين
        </h2>
      </div>

      {status === "loading" ? (
        <div
          data-qa="leaderboard-loading"
          className="mt-2.5 space-y-1.5"
          aria-label="جارٍ تحميل أفضل القصاصين"
        >
          {[0, 1, 2, 3, 4].map((row) => (
            <div
              key={row}
              className="h-12 animate-pulse rounded-2xl border-[4px] border-game-ink/25 bg-game-bg"
            />
          ))}
        </div>
      ) : status === "error" ? (
        <div
          data-qa="leaderboard-error"
          className="mt-2.5 text-center"
        >
          <p className="text-sm font-bold leading-snug text-game-ink">
            تعذّر تحميل أفضل القصاصين
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 min-h-11 rounded-xl border-[3px] border-game-ink bg-game-bg px-4 text-sm font-extrabold text-game-red"
          >
            حاول مرة ثانية
          </button>
        </div>
      ) : entries.length === 0 ? (
        <p className="mt-2.5 px-1 text-center text-sm font-medium leading-snug text-game-muted sm:text-base">
          العب أول جولة وسجّل أول نتيجة!
        </p>
      ) : (
        <ol className="mt-2.5 space-y-1.5">
          {entries.map((entry) => (
            <li
              key={`${entry.playerName}-${entry.score}`}
              data-qa="leaderboard-row"
              className="grid min-h-12 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 overflow-hidden rounded-2xl border-[4px] border-game-ink bg-game-bg px-3 py-1.5 sm:px-3.5 sm:py-2"
            >
              <span className="min-w-0 truncate text-right text-sm font-bold text-game-ink">
                {entry.playerName}
              </span>
              <span
                dir="rtl"
                className="whitespace-nowrap text-sm font-extrabold text-game-red"
              >
                <bdi dir="ltr">{toArabicNumeral(entry.score)}</bdi>{" "}
                نقطة
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
