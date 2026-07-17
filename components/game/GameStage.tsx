"use client";

import {
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  useMemo,
} from "react";
import { TableMishli } from "./TableMishli";
import { ScoreBoard } from "./ScoreBoard";
import { AttemptCutsCard } from "./AttemptCutsCard";
import { AttemptScorePop } from "./AttemptScorePop";
import { SwipeGestureHint } from "./SwipeGestureHint";
import { FinalRunModal } from "./FinalRunModal";
import { DhofarFruitStallBackground } from "./illustrations/DhofarFruitStallBackground";
import { WoodenCuttingTable } from "./illustrations/WoodenCuttingTable";
import { CutParticles } from "./CutParticles";
import { MissFlash } from "./MissFlash";
import { GameplayCleaver } from "./GameplayCleaver";
import { CuttingStreak } from "./CuttingStreak";
import { InputQaOverlay, isInputQaEnabled } from "./InputQaOverlay";
import { useGameEngine } from "@/lib/hooks/useGameEngine";
import {
  clientToLocal,
  rectToLocal,
  swipeAngleDeg,
} from "@/lib/game/coordinates";
import { getFruitTarget } from "@/lib/game/cutTargets";
import { getSwipeLength } from "@/lib/game/collision";
import { MIN_SWIPE_LENGTH } from "@/lib/game/constants";
import { ATTEMPT_FEEDBACK_MS } from "@/lib/game/scoreVersion";
import { createGameSessionId } from "@/lib/game/sessionId";
import type { Point } from "@/lib/game/types";
import {
  shouldSubmitGameResult,
  submitGameResultOnce,
  type GameRunEvent,
} from "@/lib/leaderboard/client";
import type { GameScoreSubmission } from "@/lib/leaderboard/types";

interface GameStageProps {
  onExit?: (sessionScore: number) => void;
  onLeaderboardUpdated?: () => void;
  playerName: string;
  sessionId: string;
}

interface ActiveRun {
  sessionId: string;
  startedAt: number;
}

export function GameStage({
  onExit,
  onLeaderboardUpdated,
  playerName,
  sessionId,
}: GameStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cuttingZoneRef = useRef<HTMLDivElement>(null);
  const isPointerDown = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const pointerStartLocalRef = useRef<Point | null>(null);
  const lastPointerLocal = useRef<Point | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);
  const tapFeedbackTimerRef = useRef<number | null>(null);
  const [bestScore, setBestScore] = useState(0);
  const [boardShake, setBoardShake] = useState(0);
  const [pointerLocal, setPointerLocal] = useState<Point | null>(null);
  const [clientPoint, setClientPoint] = useState<Point | null>(null);
  const [mouseInZone, setMouseInZone] = useState(false);
  const [touchActive, setTouchActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [tutorialVisible, setTutorialVisible] = useState(true);
  const [showTapFeedback, setShowTapFeedback] = useState(false);
  const [tapFeedbackKey, setTapFeedbackKey] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [cleaverAngle, setCleaverAngle] = useState(-25);
  const [cleaverFading, setCleaverFading] = useState(false);
  const [cleaverPostHitHide, setCleaverPostHitHide] = useState(false);
  const activeRunRef = useRef<ActiveRun | null>(null);
  const submittedSessionIdsRef = useRef(new Set<string>());
  const abandonedRef = useRef(false);
  const qaEnabled = isInputQaEnabled();

  const {
    state,
    startGame,
    dropComplete,
    advanceAfterFeedback,
    handlePointerDown,
    handlePointerMove,
    handlePointerCancel,
    handlePointerUp,
    finishRun,
  } = useGameEngine();

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);

  const clearTapFeedbackTimer = useCallback(() => {
    if (tapFeedbackTimerRef.current !== null) {
      window.clearTimeout(tapFeedbackTimerRef.current);
      tapFeedbackTimerRef.current = null;
    }
  }, []);

  const startNewRun = useCallback(
    (nextSessionId: string) => {
      abandonedRef.current = false;
      clearFeedbackTimer();
      clearTapFeedbackTimer();
      setShowTapFeedback(false);
      setTapFeedbackKey(0);
      setTutorialVisible(true);
      setIsDragging(false);
      pointerStartLocalRef.current = null;
      activePointerIdRef.current = null;
      activeRunRef.current = {
        sessionId: nextSessionId,
        startedAt: Date.now(),
      };
      submittedSessionIdsRef.current.clear();
      startGame();
    },
    [clearFeedbackTimer, clearTapFeedbackTimer, startGame],
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      startNewRun(sessionId);
    });
    return () => {
      cancelAnimationFrame(frame);
      clearFeedbackTimer();
      clearTapFeedbackTimer();
    };
  }, [
    sessionId,
    startNewRun,
    clearFeedbackTimer,
    clearTapFeedbackTimer,
  ]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  const submitCompletedRun = useCallback(
    (event: GameRunEvent) => {
      const run = activeRunRef.current;
      if (
        abandonedRef.current ||
        !run ||
        state.attemptScores.length !== 3 ||
        !shouldSubmitGameResult(event, state.totalScore)
      ) {
        return;
      }

      // Zero-point completed runs are valid locally but must not POST
      // while the database check still requires score > 0.
      if (state.totalScore <= 0) return;

      const result: GameScoreSubmission = {
        sessionId: run.sessionId,
        playerName,
        score: state.totalScore,
        levelReached: 1,
        successfulHits: state.successfulHits,
        mistakes: state.mistakes,
        durationMs: Math.max(0, Date.now() - run.startedAt),
        attemptScores: [
          state.attemptScores[0] ?? 0,
          state.attemptScores[1] ?? 0,
          state.attemptScores[2] ?? 0,
        ],
      };

      void submitGameResultOnce(
        result,
        submittedSessionIdsRef.current,
      ).then((response) => {
        if (response?.saved) onLeaderboardUpdated?.();
      });
    },
    [
      onLeaderboardUpdated,
      playerName,
      state.attemptScores,
      state.mistakes,
      state.successfulHits,
      state.totalScore,
    ],
  );

  useEffect(() => {
    if (state.status !== "runComplete") return;

    const best = finishRun();
    queueMicrotask(() => setBestScore(best));
    submitCompletedRun("gameOver");
  }, [state.status, finishRun, submitCompletedRun]);

  useEffect(() => {
    if (state.cutFeedbackKey <= 0 || state.status !== "playing") return;

    clearFeedbackTimer();
    feedbackTimerRef.current = window.setTimeout(() => {
      advanceAfterFeedback();
    }, ATTEMPT_FEEDBACK_MS);

    return clearFeedbackTimer;
  }, [
    state.cutFeedbackKey,
    state.status,
    advanceAfterFeedback,
    clearFeedbackTimer,
  ]);

  useEffect(() => {
    if (state.cutFeedbackKey <= 0) return;
    if (
      state.phase !== "resolving-attempt" &&
      state.phase !== "showing-result"
    ) {
      return;
    }

    const isHit = state.lastFruitScore > 0;
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      setBoardShake(0);
      setCleaverPostHitHide(false);
      setCleaverFading(true);
      if (isHit) {
        secondFrame = requestAnimationFrame(() => {
          setBoardShake(state.cutFeedbackKey);
        });
      }
    });
    const fadeTimer = window.setTimeout(() => {
      setCleaverFading(false);
      setCleaverPostHitHide(true);
    }, 140);
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      window.clearTimeout(fadeTimer);
    };
  }, [state.cutFeedbackKey, state.lastFruitScore, state.phase]);

  const toLocal = useCallback(
    (clientX: number, clientY: number): Point | null => {
      const stage = stageRef.current?.getBoundingClientRect();
      if (!stage) return null;
      return clientToLocal(clientX, clientY, stage);
    },
    [],
  );

  const getRects = useCallback(() => {
    const stage = stageRef.current?.getBoundingClientRect();
    if (!stage) return { hitbox: null, fruitBody: null };
    const bodyEl = stageRef.current?.querySelector(
      "[data-qa=fruit-body]",
    ) as HTMLElement | null;
    const hitEl = stageRef.current?.querySelector(
      "[data-qa=coconut-hitbox]",
    ) as HTMLElement | null;
    // Prefer the husk hitbox; fall back to the visible fruit body.
    const fruitSource = hitEl ?? bodyEl;
    const fruitBody = bodyEl
      ? rectToLocal(bodyEl.getBoundingClientRect(), stage)
      : null;
    return {
      hitbox: fruitSource
        ? rectToLocal(fruitSource.getBoundingClientRect(), stage)
        : null,
      fruitBody,
    };
  }, []);

  const inputLocked =
    state.phase !== "ready" || state.status !== "playing";

  const updatePointer = useCallback(
    (clientX: number, clientY: number, pointerType: string) => {
      const local = toLocal(clientX, clientY);
      if (!local) return;
      setClientPoint({ x: clientX, y: clientY });
      if (qaEnabled && typeof window !== "undefined") {
        (
          window as Window & { __lastPointerClient?: Point }
        ).__lastPointerClient = { x: clientX, y: clientY };
      }
      setPointerLocal(local);
      if (lastPointerLocal.current) {
        const deltaX = local.x - lastPointerLocal.current.x;
        const deltaY = local.y - lastPointerLocal.current.y;
        if (Math.hypot(deltaX, deltaY) > 1.5) {
          setCleaverAngle((Math.atan2(deltaY, deltaX) * 180) / Math.PI);
        }
      } else if (state.activeSlash) {
        setCleaverAngle(swipeAngleDeg(state.activeSlash.start, local));
      }
      lastPointerLocal.current = local;
      if (pointerType === "touch") setTouchActive(true);
    },
    [toLocal, state.activeSlash, qaEnabled],
  );

  const onZonePointerEnter = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setMouseInZone(true);
  }, []);

  const onZonePointerLeave = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && !isPointerDown.current) {
      setMouseInZone(false);
      setPointerLocal(null);
      lastPointerLocal.current = null;
    }
  }, []);

  const showTapDragInstruction = useCallback(() => {
    clearTapFeedbackTimer();
    setShowTapFeedback(true);
    setTapFeedbackKey((key) => key + 1);
    tapFeedbackTimerRef.current = window.setTimeout(() => {
      setShowTapFeedback(false);
      tapFeedbackTimerRef.current = null;
    }, 1_200);
  }, [clearTapFeedbackTimer]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (inputLocked || state.isDropping) return;
      e.preventDefault();
      isPointerDown.current = true;
      activePointerIdRef.current = e.pointerId;
      setIsDragging(false);
      setCleaverFading(false);
      setCleaverPostHitHide(false);
      try {
        cuttingZoneRef.current?.setPointerCapture(e.pointerId);
      } catch {
        // Capture can fail if the pointer was already released.
      }
      updatePointer(e.clientX, e.clientY, e.pointerType);
      const local = toLocal(e.clientX, e.clientY);
      pointerStartLocalRef.current = local;
      if (local) handlePointerDown(local);
    },
    [
      inputLocked,
      state.isDropping,
      updatePointer,
      toLocal,
      handlePointerDown,
    ],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      updatePointer(e.clientX, e.clientY, e.pointerType);
      if (!isPointerDown.current || inputLocked) return;
      const local = toLocal(e.clientX, e.clientY);
      if (local) {
        const start = pointerStartLocalRef.current;
        if (start && getSwipeLength(start, local) >= MIN_SWIPE_LENGTH) {
          setIsDragging(true);
        }
        handlePointerMove(local);
      }
    },
    [updatePointer, toLocal, handlePointerMove, inputLocked],
  );

  const releaseCapture = useCallback((pointerId: number) => {
    const zone = cuttingZoneRef.current;
    if (!zone) return;
    try {
      if (zone.hasPointerCapture(pointerId)) {
        zone.releasePointerCapture(pointerId);
      }
    } catch {
      // Ignore release races on unmount / cancelled pointers.
    }
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const wasDown = isPointerDown.current;
      isPointerDown.current = false;
      releaseCapture(e.pointerId);
      activePointerIdRef.current = null;
      setIsDragging(false);
      if (e.pointerType === "touch") {
        setTouchActive(false);
        setPointerLocal(null);
        lastPointerLocal.current = null;
      }
      if (!wasDown || inputLocked) {
        pointerStartLocalRef.current = null;
        return;
      }
      const local = toLocal(e.clientX, e.clientY);
      const start = pointerStartLocalRef.current;
      pointerStartLocalRef.current = null;
      if (!local || !start) {
        handlePointerCancel();
        return;
      }
      const swipeLength = getSwipeLength(start, local);
      if (swipeLength < MIN_SWIPE_LENGTH) {
        // Clear the engine gesture without consuming an attempt, then teach.
        handlePointerUp(local, null, null);
        showTapDragInstruction();
        return;
      }
      clearTapFeedbackTimer();
      setShowTapFeedback(false);
      setTutorialVisible(false);
      // Fresh query after each attempt so fruit 2/3 refs stay valid.
      const { hitbox, fruitBody } = getRects();
      handlePointerUp(local, hitbox, fruitBody);
    },
    [
      toLocal,
      getRects,
      handlePointerUp,
      handlePointerCancel,
      inputLocked,
      releaseCapture,
      showTapDragInstruction,
      clearTapFeedbackTimer,
    ],
  );

  const onPointerCancel = useCallback(
    (e: React.PointerEvent) => {
      isPointerDown.current = false;
      activePointerIdRef.current = null;
      pointerStartLocalRef.current = null;
      lastPointerLocal.current = null;
      setIsDragging(false);
      setTouchActive(false);
      setPointerLocal(null);
      releaseCapture(e.pointerId);
      handlePointerCancel();
    },
    [handlePointerCancel, releaseCapture],
  );

  useEffect(() => {
    const zone = cuttingZoneRef.current;
    return () => {
      const pointerId = activePointerIdRef.current;
      if (zone && pointerId !== null) {
        try {
          if (zone.hasPointerCapture(pointerId)) {
            zone.releasePointerCapture(pointerId);
          }
        } catch {
          // The browser may already have cancelled this pointer.
        }
      }
      activePointerIdRef.current = null;
      pointerStartLocalRef.current = null;
      isPointerDown.current = false;
    };
  }, []);

  const handlePlayAgain = () => {
    startNewRun(createGameSessionId());
  };

  const handleExit = () => {
    abandonedRef.current = state.status !== "runComplete";
    clearFeedbackTimer();
    clearTapFeedbackTimer();
    setShowTapFeedback(false);
    handlePointerCancel();
    isPointerDown.current = false;
    pointerStartLocalRef.current = null;
    // Incomplete runs must not submit. Completed runs already submitted on finish.
    if (state.status === "runComplete") {
      // no-op — already submitted once
    }
    onExit?.(state.totalScore);
  };

  const showScorePop =
    state.cutFeedbackKey > 0 &&
    (state.phase === "resolving-attempt" ||
      state.phase === "showing-result");

  const showMiss =
    state.lastFruitScore === 0 &&
    state.cutFeedbackKey > 0 &&
    showScorePop;

  const particleQuality =
    state.lastFruitScore >= 800
      ? "clean"
      : state.lastFruitScore >= 400
        ? "edge"
        : state.lastFruitScore > 0
          ? "weak"
          : null;

  const hitShakeKey = state.lastFruitScore > 0 ? state.cutFeedbackKey : 0;
  const impactPoint = state.lastHitPoint;
  const [popAnchor, setPopAnchor] = useState<Point | null>(null);

  useLayoutEffect(() => {
    if (!showScorePop || !stageRef.current) {
      setPopAnchor(null);
      return;
    }

    const stageEl = stageRef.current;
    const stage = stageEl.getBoundingClientRect();
    const bodyEl = stageEl.querySelector(
      "[data-qa=fruit-body]",
    ) as HTMLElement | null;
    const hitEl = stageEl.querySelector(
      "[data-qa=coconut-hitbox]",
    ) as HTMLElement | null;

    const fruitVisualEl =
      (bodyEl?.querySelector("svg") as HTMLElement | null) ?? bodyEl;
    if (!fruitVisualEl) {
      setPopAnchor(
        impactPoint
          ? { x: impactPoint.x, y: impactPoint.y - 28 }
          : { x: stage.width / 2, y: stage.height * 0.42 },
      );
      return;
    }

    const fruitVisual = rectToLocal(
      fruitVisualEl.getBoundingClientRect(),
      stage,
    );
    const fruitTop = hitEl
      ? rectToLocal(hitEl.getBoundingClientRect(), stage).top
      : fruitVisual.top;

    const padX = 48;
    // Misses often land off-fruit — keep feedback above the Mishli, clear of HUD.
    const preferFruitCentre = state.lastFruitScore === 0;
    let x = preferFruitCentre
      ? fruitVisual.left + fruitVisual.width / 2
      : (impactPoint?.x ?? fruitVisual.left + fruitVisual.width / 2);
    let y = fruitTop - 40;
    y = Math.max(88, Math.min(y, stage.height * 0.42));
    x = Math.min(Math.max(x, padX), stage.width - padX);
    setPopAnchor({ x, y });
  }, [showScorePop, impactPoint, state.cutFeedbackKey, state.lastFruitScore]);

  const cleaverPos = useMemo(() => {
    // GameplayCleaver positions its blade anchor at x/y, so impact needs no offset.
    if (impactPoint && cleaverFading) return impactPoint;
    return pointerLocal ?? impactPoint;
  }, [impactPoint, cleaverFading, pointerLocal]);

  const showCleaver =
    Boolean(cleaverPos) &&
    (cleaverFading ||
      ((mouseInZone || touchActive) && !cleaverPostHitHide)) &&
    state.status === "playing" &&
    (cleaverFading || !state.isDropping);

  const cleaverVisibleAngle =
    state.lastSwipeAngle && cleaverFading
      ? state.lastSwipeAngle
      : state.activeSlash
        ? swipeAngleDeg(state.activeSlash.start, state.activeSlash.end)
        : cleaverAngle;

  const [crackCentre, setCrackCentre] = useState<Point | null>(null);

  useLayoutEffect(() => {
    const last = state.mishliHitMarks[state.mishliHitMarks.length - 1];
    if (!last || !stageRef.current) {
      setCrackCentre(null);
      return;
    }
    const bodyEl = stageRef.current.querySelector(
      "[data-qa=fruit-body]",
    ) as HTMLElement | null;
    const stage = stageRef.current.getBoundingClientRect();
    if (!bodyEl) {
      setCrackCentre(null);
      return;
    }
    const body = bodyEl.getBoundingClientRect();
    const localBody = rectToLocal(body, stage);
    setCrackCentre({
      x: localBody.left + last.x * localBody.width,
      y: localBody.top + last.y * localBody.height,
    });
  }, [state.mishliHitMarks, state.cutFeedbackKey]);

  const [qaLocalPointer, setQaLocalPointer] = useState<Point | null>(null);

  useEffect(() => {
    if (!qaEnabled || !clientPoint || !stageRef.current) {
      setQaLocalPointer(null);
      return;
    }
    setQaLocalPointer(
      clientToLocal(
        clientPoint.x,
        clientPoint.y,
        stageRef.current.getBoundingClientRect(),
      ),
    );
  }, [qaEnabled, clientPoint]);

  const cutTarget = getFruitTarget(state.attemptIndex);
  const showFruit =
    state.status === "playing" || state.status === "runComplete";

  return (
    <div
      ref={stageRef}
      data-qa="game-stage"
      data-phase={state.phase}
      data-attempt-count={state.attemptScores.length}
      data-attempt-index={state.attemptIndex}
      data-impact-x={state.lastHitPoint?.x ?? ""}
      data-impact-y={state.lastHitPoint?.y ?? ""}
      className="relative mx-auto min-h-svh w-full touch-none overscroll-none"
    >
      <DhofarFruitStallBackground />

      <div
        data-qa="game-hud"
        className="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 pt-[max(1.1rem,env(safe-area-inset-top))]"
      >
        {/* LTR row: score physical left, cuts physical right — independent of page RTL */}
        <div dir="ltr" className="flex items-start justify-between gap-2">
          <ScoreBoard score={state.totalScore} />
          <AttemptCutsCard
            attemptScores={state.attemptScores}
            activeAttempt={state.attemptIndex}
            phase={state.phase}
          />
        </div>
      </div>

      {state.status === "playing" &&
        state.attemptIndex === 0 &&
        state.phase === "ready" &&
        (tutorialVisible || showTapFeedback) && (
          <div className="pointer-events-none absolute inset-x-0 top-[6rem] z-[29] mx-auto w-[calc(100%-3rem)] max-w-[20rem]">
            <SwipeGestureHint
              mode={showTapFeedback ? "tap-feedback" : "tutorial"}
              shakeKey={tapFeedbackKey}
            />
          </div>
        )}

      <WoodenCuttingTable
        boardShake={boardShake > 0}
        cuttingZoneRef={cuttingZoneRef}
        cuttingZoneProps={{
          className: isDragging ? "cursor-grabbing" : "cursor-grab",
          onPointerEnter: onZonePointerEnter,
          onPointerLeave: onZonePointerLeave,
          onPointerDown,
          onPointerMove,
          onPointerUp,
          onPointerCancel,
        }}
      >
        {showFruit && state.status === "playing" && (
          <TableMishli
            isSplitting={state.isDropping}
            onSplitComplete={dropComplete}
            hitShakeKey={hitShakeKey}
            scale={state.coconutScale}
            hitMarks={state.mishliHitMarks}
            cutTarget={cutTarget}
            showCutTarget={state.phase === "ready"}
          />
        )}
      </WoodenCuttingTable>

      {onExit && (
        <button
          type="button"
          onClick={handleExit}
          className="stall-back-tag pointer-events-auto absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-30 px-4 py-2 text-sm"
        >
          رجوع
        </button>
      )}

      <div className="pointer-events-none absolute inset-0 z-20">
        <GameplayCleaver
          x={cleaverPos?.x ?? 0}
          y={cleaverPos?.y ?? 0}
          angle={cleaverVisibleAngle}
          visible={showCleaver}
          fading={cleaverFading}
          reducedMotion={reducedMotion}
          showAnchorDebug={qaEnabled}
        />

        <CuttingStreak
          origin={impactPoint}
          angle={state.lastSwipeAngle}
          streakKey={state.cutFeedbackKey}
          visible={state.lastFruitScore > 0 && showScorePop}
        />

        <CutParticles
          triggerKey={state.cutFeedbackKey}
          origin={impactPoint}
          quality={particleQuality}
        />

        <AttemptScorePop
          score={state.lastFruitScore}
          label={state.lastQualityLabel}
          visible={showScorePop}
          popKey={state.cutFeedbackKey}
          anchor={popAnchor}
        />

        <MissFlash flashKey={state.cutFeedbackKey} active={showMiss} />
      </div>

      {qaEnabled && (
        <InputQaOverlay
          clientPoint={qaLocalPointer}
          localPoint={pointerLocal}
          cleaverAnchor={cleaverPos}
          impactPoint={impactPoint}
          crackCentre={crackCentre}
        />
      )}

      <FinalRunModal
        open={state.status === "runComplete"}
        totalScore={state.totalScore}
        bestScore={Math.max(bestScore, state.bestScore)}
        attemptScores={state.attemptScores}
        onPlayAgain={handlePlayAgain}
        onExit={onExit ? handleExit : undefined}
      />
    </div>
  );
}
