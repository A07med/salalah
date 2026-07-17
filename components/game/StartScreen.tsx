"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CoconutIllustration } from "./CoconutIllustration";
import { EventBanner } from "./EventBanner";
import { GamePaperBackground } from "./GamePaperBackground";
import { LeaderboardPanel } from "./LeaderboardPanel";
import { PlayerNameInput } from "./PlayerNameInput";
import { Button } from "@/components/ui/Button";
import { toArabicNumeral } from "@/lib/game/arabicNumerals";
import {
  getPlayerName,
  savePlayerName,
  validatePlayerName,
} from "@/lib/game/storage";
import type {
  GlobalLeaderboardEntry,
  LeaderboardResponse,
} from "@/lib/leaderboard/types";

interface StartScreenProps {
  bestScore: number;
  leaderboardRevision?: number;
  onStart: (playerName: string) => void;
}

/** Shared content column — always single-column inside the 480px GameShell canvas */
const contentClass =
  "mx-auto w-[calc(100%-32px)] min-w-0 max-w-[380px]";

/** Input + CTA share one stretch column (same outer edges including hard shadow) */
const controlClass =
  "start-form mx-auto w-[calc(100%-32px)] min-w-0 max-w-[380px]";

export function StartScreen({
  bestScore,
  leaderboardRevision = 0,
  onStart,
}: StartScreenProps) {
  // Avoid rendering local-only state before hydration.
  const [playerName, setPlayerName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<GlobalLeaderboardEntry[]>([]);
  const [leaderboardStatus, setLeaderboardStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const leaderboardAbortRef = useRef<AbortController | null>(null);
  const startTransitioningRef = useRef(false);
  const [shakeForm, setShakeForm] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setPlayerName(getPlayerName());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const loadLeaderboard = useCallback(async () => {
    leaderboardAbortRef.current?.abort();
    const controller = new AbortController();
    leaderboardAbortRef.current = controller;

    try {
      const response = await fetch(
        `/api/leaderboard?limit=5&revision=${leaderboardRevision}`,
        {
          cache: "no-store",
          signal: controller.signal,
        },
      );
      if (!response.ok) throw new Error("Leaderboard unavailable");

      const data = (await response.json()) as LeaderboardResponse;
      if (!Array.isArray(data.entries)) {
        throw new Error("Invalid leaderboard response");
      }

      setLeaderboard(data.entries.slice(0, 5));
      setLeaderboardStatus("success");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setLeaderboardStatus("error");
    }
  }, [leaderboardRevision]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void loadLeaderboard();
    });
    return () => {
      cancelAnimationFrame(frame);
      leaderboardAbortRef.current?.abort();
    };
  }, [loadLeaderboard]);

  const handleStart = useCallback(() => {
    if (startTransitioningRef.current) return;

    const error = validatePlayerName(playerName);
    if (error) {
      setNameError(error);
      setShakeForm(true);
      window.setTimeout(() => setShakeForm(false), 300);
      return;
    }

    startTransitioningRef.current = true;
    setIsStarting(true);
    setNameError(null);
    try {
      savePlayerName(playerName);
    } catch (storageError) {
      if (process.env.NODE_ENV !== "production") {
        console.error(
          "[game] Player name could not be saved locally.",
          storageError instanceof Error ? storageError.message : "Unknown error",
        );
      }
    }

    try {
      onStart(playerName.trim());
    } catch (startError) {
      startTransitioningRef.current = false;
      setIsStarting(false);
      if (process.env.NODE_ENV !== "production") {
        console.error(
          "[game] Local start transition failed.",
          startError instanceof Error ? startError.message : "Unknown error",
        );
      }
    }
  }, [onStart, playerName]);

  return (
    <div
      data-qa="start-scroll"
      className="relative h-svh w-full min-w-0 overflow-x-clip overflow-y-auto overscroll-contain touch-pan-y"
    >
      <GamePaperBackground>
        <div
          data-qa="start-column"
          className="relative z-10 mx-auto flex w-full min-w-0 flex-col items-center gap-2.5 px-0 pb-4 pt-[max(16px,env(safe-area-inset-top))]"
        >
          <div
            data-qa="start-banner"
            className={`game-sticker-pop flex justify-center ${contentClass} max-w-[360px]`}
          >
            <EventBanner className="max-w-full" />
          </div>

          <div
            data-qa="start-headline"
            className={`game-headline-wrap game-sticker-pop mt-3.5 ${contentClass}`}
          >
            <h1 className="game-headline-hero text-center font-display font-extrabold text-game-red">
              <span className="game-headline-line">تحدي مشلي</span>
              <span className="game-headline-line">الخريف</span>
            </h1>
          </div>

          <div
            data-qa="start-hero"
            className="game-sticker-pop relative mt-6 flex w-[clamp(155px,43%,190px)] max-w-[190px] justify-center"
          >
            <CoconutIllustration
              cutProgress={35}
              idPrefix="start"
              showHintSlash
              variant="sticker"
              className="h-auto w-full"
            />
          </div>

          <div
            data-qa="start-instructions"
            className={`mt-1 space-y-1.5 text-center ${contentClass} max-w-[360px]`}
          >
            <p className="text-[1.0625rem] font-extrabold leading-relaxed text-game-ink">
             اقطع المشلي بضربه وحدة
            </p>
            <p className="text-[0.8125rem] font-semibold leading-relaxed text-game-ink/85">
              كلما اقتربت ضربة الساطور من العلامة، زادت نقاطك!
            </p>
          </div>

          {bestScore > 0 && (
            <div
              data-qa="start-best-score"
              className="game-surface mx-auto inline-flex w-[calc(100%-32px)] min-w-0 max-w-[280px] items-center justify-center gap-2.5 rounded-full px-4 py-1.5"
            >
              <span className="shrink-0 text-xs font-bold text-game-muted">
                أفضل نتيجة
              </span>
              <bdi
                className="font-display text-lg font-extrabold tabular-nums text-game-red"
                dir="ltr"
              >
                {toArabicNumeral(bestScore)}
              </bdi>
            </div>
          )}

          <div
            data-qa="start-form"
            className={`mt-1 ${controlClass} ${shakeForm ? "animate-screen-shake" : ""}`}
          >
            <PlayerNameInput
              value={playerName}
              onChange={(v) => {
                setPlayerName(v);
                if (nameError) setNameError(null);
              }}
              onSubmit={handleStart}
              error={nameError}
            />

            <div data-qa="start-cta" className="w-full min-w-0">
              <Button
                type="button"
                variant="game"
                onClick={handleStart}
                disabled={isStarting}
                className="min-h-[3.25rem] w-full px-0 font-display text-lg"
              >
                ابدأ اللعب
              </Button>
            </div>
          </div>

          <div
            data-qa="start-leaderboard"
            className={`pb-2 ${contentClass} max-w-[360px]`}
          >
            <LeaderboardPanel
              entries={leaderboard}
              status={leaderboardStatus}
              onRetry={() => {
                setLeaderboardStatus("loading");
                void loadLeaderboard();
              }}
            />
          </div>
        </div>
      </GamePaperBackground>
    </div>
  );
}
