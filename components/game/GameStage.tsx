"use client";

import { useRef, useCallback, useEffect, useLayoutEffect, useState, useMemo } from "react";
import { TableMishli } from "./TableMishli";
import { CutProgress } from "./CutProgress";
import { ScoreBoard } from "./ScoreBoard";
import { LevelBadge } from "./LevelBadge";
import { MissCounter } from "./MissCounter";
import { DhofarFruitStallBackground } from "./illustrations/DhofarFruitStallBackground";
import { WoodenCuttingTable } from "./illustrations/WoodenCuttingTable";
import { CutParticles } from "./CutParticles";
import { ProgressPop } from "./ProgressPop";
import { MissFlash } from "./MissFlash";
import { LevelCompleteModal } from "./LevelCompleteModal";
import { GameOverModal } from "./GameOverModal";
import { CLEAVER_RENDER_SIZE, GameplayCleaver } from "./GameplayCleaver";
import { CuttingStreak } from "./CuttingStreak";
import { InputQaOverlay, isInputQaEnabled } from "./InputQaOverlay";
import { useGameEngine } from "@/lib/hooks/useGameEngine";
import { clientToLocal, rectToLocal, swipeAngleDeg } from "@/lib/game/coordinates";
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
  successfulHits: number;
  mistakes: number;
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
  const lastPointerLocal = useRef<Point | null>(null);
  const [bestScore, setBestScore] = useState(0);
  const [boardShake, setBoardShake] = useState(0);
  const [pointerLocal, setPointerLocal] = useState<Point | null>(null);
  const [clientPoint, setClientPoint] = useState<Point | null>(null);
  const [mouseInZone, setMouseInZone] = useState(false);
  const [touchActive, setTouchActive] = useState(false);
  const [cleaverAngle, setCleaverAngle] = useState(-25);
  const [cleaverFading, setCleaverFading] = useState(false);
  /** Hide cleaver after impact fade so it does not reappear embedded in the fruit. */
  const [cleaverPostHitHide, setCleaverPostHitHide] = useState(false);
  const activeRunRef = useRef<ActiveRun | null>(null);
  const submittedSessionIdsRef = useRef(new Set<string>());
  const lastTrackedFeedbackKeyRef = useRef(0);
  const qaEnabled = isInputQaEnabled();

  const {
    state,
    startGame,
    nextLevel,
    dropComplete,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    finishGameOver,
  } = useGameEngine();

  const startNewRun = useCallback((nextSessionId: string) => {
    activeRunRef.current = {
      sessionId: nextSessionId,
      startedAt: Date.now(),
      successfulHits: 0,
      mistakes: 0,
    };
    submittedSessionIdsRef.current.clear();
    lastTrackedFeedbackKeyRef.current = 0;
    startGame();
  }, [startGame]);

  useEffect(() => {
    startNewRun(sessionId);
  }, [sessionId, startNewRun]);

  useEffect(() => {
    const run = activeRunRef.current;
    if (
      !run ||
      state.cutFeedbackKey === 0 ||
      state.cutFeedbackKey === lastTrackedFeedbackKeyRef.current
    ) {
      return;
    }

    lastTrackedFeedbackKeyRef.current = state.cutFeedbackKey;
    if (state.lastCutQuality === "miss") {
      run.mistakes += 1;
    } else if (state.lastCutQuality) {
      run.successfulHits += 1;
    }
  }, [state.cutFeedbackKey, state.lastCutQuality]);

  const submitCurrentRun = useCallback(
    (
      score: number,
      levelReached: number,
      event: GameRunEvent,
    ) => {
      const run = activeRunRef.current;
      if (!run || !shouldSubmitGameResult(event, score)) return;

      const result: GameScoreSubmission = {
        sessionId: run.sessionId,
        playerName,
        score,
        levelReached,
        successfulHits: run.successfulHits,
        mistakes: run.mistakes,
        durationMs: Math.max(0, Date.now() - run.startedAt),
      };

      void submitGameResultOnce(
        result,
        submittedSessionIdsRef.current,
      ).then((response) => {
        if (response?.saved) onLeaderboardUpdated?.();
      });
    },
    [onLeaderboardUpdated, playerName],
  );

  useEffect(() => {
    if (state.status !== "gameOver") return;

    const best = finishGameOver();
    queueMicrotask(() => setBestScore(best));
    submitCurrentRun(state.score, state.level, "gameOver");
  }, [
    state.status,
    state.score,
    state.level,
    finishGameOver,
    submitCurrentRun,
  ]);

  useEffect(() => {
    if (
      state.lastCutQuality &&
      state.lastCutQuality !== "miss" &&
      state.cutFeedbackKey > 0
    ) {
      let secondFrame = 0;
      const firstFrame = requestAnimationFrame(() => {
        setBoardShake(0);
        setCleaverPostHitHide(false);
        setCleaverFading(true);
        secondFrame = requestAnimationFrame(() => {
          setBoardShake(state.cutFeedbackKey);
        });
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
    }
  }, [state.cutFeedbackKey, state.lastCutQuality]);

  const toLocal = useCallback((clientX: number, clientY: number): Point | null => {
    const stage = stageRef.current?.getBoundingClientRect();
    if (!stage) return null;
    return clientToLocal(clientX, clientY, stage);
  }, []);

  const getRects = useCallback(() => {
    const stage = stageRef.current?.getBoundingClientRect();
    if (!stage) return { hitbox: null, fruitBody: null };
    const hitEl = stageRef.current?.querySelector(
      "[data-qa=coconut-hitbox]",
    ) as HTMLElement | null;
    const bodyEl = stageRef.current?.querySelector(
      "[data-qa=fruit-body]",
    ) as HTMLElement | null;
    return {
      hitbox: hitEl ? rectToLocal(hitEl.getBoundingClientRect(), stage) : null,
      fruitBody: bodyEl
        ? rectToLocal(bodyEl.getBoundingClientRect(), stage)
        : null,
    };
  }, []);

  const updatePointer = useCallback(
    (clientX: number, clientY: number, pointerType: string) => {
      const local = toLocal(clientX, clientY);
      if (!local) return;
      setClientPoint({ x: clientX, y: clientY });
      if (qaEnabled && typeof window !== "undefined") {
        (window as Window & { __lastPointerClient?: Point }).__lastPointerClient =
          { x: clientX, y: clientY };
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

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (state.status !== "playing" || state.isDropping) return;
      isPointerDown.current = true;
      setCleaverFading(false);
      setCleaverPostHitHide(false);
      cuttingZoneRef.current?.setPointerCapture(e.pointerId);
      updatePointer(e.clientX, e.clientY, e.pointerType);
      const local = toLocal(e.clientX, e.clientY);
      if (local) handlePointerDown(local);
    },
    [state.status, state.isDropping, updatePointer, toLocal, handlePointerDown],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      updatePointer(e.clientX, e.clientY, e.pointerType);
      if (!isPointerDown.current) return;
      const local = toLocal(e.clientX, e.clientY);
      if (local) handlePointerMove(local);
    },
    [updatePointer, toLocal, handlePointerMove],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const wasDown = isPointerDown.current;
      isPointerDown.current = false;
      if (cuttingZoneRef.current?.hasPointerCapture(e.pointerId)) {
        cuttingZoneRef.current.releasePointerCapture(e.pointerId);
      }
      if (e.pointerType === "touch") {
        setTouchActive(false);
        setPointerLocal(null);
        lastPointerLocal.current = null;
      }
      if (!wasDown) return;
      const local = toLocal(e.clientX, e.clientY);
      if (!local) return;
      const { hitbox, fruitBody } = getRects();
      handlePointerUp(local, hitbox, fruitBody);
    },
    [toLocal, getRects, handlePointerUp],
  );

  const handlePlayAgain = () => {
    startNewRun(createGameSessionId());
  };

  const handleExit = () => {
    submitCurrentRun(state.score, state.level, "exit");
    onExit?.(state.score);
  };

  const showProgressPop = useMemo(
    () =>
      Boolean(
        state.lastCutQuality &&
          state.lastCutQuality !== "miss" &&
          state.lastDamage > 0 &&
          state.lastHitPoint,
      ),
    [state.lastCutQuality, state.lastDamage, state.lastHitPoint],
  );

  const showMiss =
    state.lastCutQuality === "miss" && state.cutFeedbackKey > 0;

  const particleQuality =
    state.lastCutQuality === "miss" ? null : state.lastCutQuality;

  const hitShakeKey =
    state.lastCutQuality && state.lastCutQuality !== "miss"
      ? state.cutFeedbackKey
      : 0;

  const impactPoint = state.lastHitPoint;

  const [popAnchor, setPopAnchor] = useState<Point | null>(null);

  useLayoutEffect(() => {
    if (
      !showProgressPop ||
      !impactPoint ||
      !stageRef.current
    ) {
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
    const barEl = stageEl.querySelector(
      "[data-qa=cut-progress-bar]",
    ) as HTMLElement | null;

    const fruitVisualEl =
      (bodyEl?.querySelector("svg") as HTMLElement | null) ?? bodyEl;
    if (!fruitVisualEl) {
      setPopAnchor({ x: impactPoint.x, y: impactPoint.y - 28 });
      return;
    }

    const fruitVisual = rectToLocal(
      fruitVisualEl.getBoundingClientRect(),
      stage,
    );
    // Hitbox top tracks the green body better than the rotated SVG AABB.
    const fruitTop = hitEl
      ? rectToLocal(hitEl.getBoundingClientRect(), stage).top
      : fruitVisual.top;

    const padX = 36;
    const padY = 28;
    const popHalfW = 36;
    const popH = 20;

    let x = impactPoint.x;
    // Bottom of pop = fruitVisualRect.top - 28 (ProgressPop uses translate -100%)
    let y = fruitTop - 28;

    if (barEl) {
      const bar = rectToLocal(barEl.getBoundingClientRect(), stage);
      const barBottom = bar.top + bar.height + 6;
      if (y - popH < barBottom + 4) {
        y = barBottom + popH + 4;
      }
    }

    y = Math.min(y, fruitTop - 12);
    y = Math.max(padY, y);
    x = Math.min(Math.max(x, padX), stage.width - padX);
    x = Math.min(Math.max(x, popHalfW), stage.width - popHalfW);

    setPopAnchor({ x, y });
  }, [showProgressPop, impactPoint, state.cutFeedbackKey]);

  /* Existing pointer geometry intentionally reads the mounted stage during render. */
  /* eslint-disable react-hooks/refs */
  const cleaverPos = useMemo(() => {
    // Pointer follow stays exact for alignment QA; only impact-fade pose is offset.
    if (!(impactPoint && cleaverFading)) {
      return pointerLocal ?? impactPoint;
    }
    if (!stageRef.current) return impactPoint;

    const bodyEl = stageRef.current.querySelector(
      "[data-qa=fruit-body]",
    ) as HTMLElement | null;
    const visualEl =
      (bodyEl?.querySelector("svg") as HTMLElement | null) ?? bodyEl;
    if (!visualEl) return impactPoint;

    const stage = stageRef.current.getBoundingClientRect();
    const fruit = rectToLocal(visualEl.getBoundingClientRect(), stage);
    const fx = fruit.left + fruit.width / 2;
    const fy = fruit.top + fruit.height / 2;
    let dx = impactPoint.x - fx;
    let dy = impactPoint.y - fy;
    let len = Math.hypot(dx, dy);
    if (len < 1) {
      const rad =
        (((state.lastSwipeAngle ?? cleaverAngle) * Math.PI) / 180);
      dx = Math.cos(rad);
      dy = Math.sin(rad);
      len = 1;
    } else {
      dx /= len;
      dy /= len;
    }

    // Keep blade edge near the impact; pull outward so the handle stays outside.
    const pullOut = CLEAVER_RENDER_SIZE * 0.34;
    return {
      x: impactPoint.x + dx * pullOut,
      y: impactPoint.y + dy * pullOut,
    };
  }, [
    impactPoint,
    cleaverFading,
    pointerLocal,
    cleaverAngle,
    state.lastSwipeAngle,
  ]);
  /* eslint-enable react-hooks/refs */

  const showCleaver =
    Boolean(cleaverPos) &&
    (cleaverFading ||
      ((mouseInZone || touchActive) && !cleaverPostHitHide)) &&
    state.status === "playing" &&
    !state.isDropping;

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

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      ref={stageRef}
      data-qa="game-stage"
      className="relative mx-auto min-h-svh w-full touch-pan-y"
    >
      <DhofarFruitStallBackground />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-start justify-between gap-2">
          <MissCounter missCount={state.missCount} maxMisses={state.maxMisses} />
          <LevelBadge level={state.level} />
          <ScoreBoard score={state.score} />
        </div>
      </div>

      <WoodenCuttingTable
        boardShake={boardShake > 0}
        progress={<CutProgress progress={state.cutProgress} />}
        cuttingZoneRef={cuttingZoneRef}
        cuttingZoneProps={{
          className: mouseInZone ? "cursor-none" : "",
          onPointerEnter: onZonePointerEnter,
          onPointerLeave: onZonePointerLeave,
          onPointerDown,
          onPointerMove,
          onPointerUp,
          onPointerCancel: onPointerUp,
        }}
      >
        {(state.status === "playing" || state.status === "levelComplete") && (
          <TableMishli
            cutProgress={state.cutProgress}
            isSplitting={state.isDropping}
            keepHalves={state.status === "levelComplete" && !state.isDropping}
            onSplitComplete={dropComplete}
            hitShakeKey={hitShakeKey}
            scale={state.coconutScale}
            hitMarks={state.mishliHitMarks}
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
          visible={showProgressPop}
        />

        <CutParticles
          triggerKey={state.cutFeedbackKey}
          origin={impactPoint}
          quality={particleQuality}
        />

        <ProgressPop
          amount={state.lastDamage}
          visible={showProgressPop}
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

      <LevelCompleteModal
        open={state.status === "levelComplete" && !state.isDropping}
        level={state.level}
        bonus={state.levelCompleteBonus}
        onNext={nextLevel}
      />

      <GameOverModal
        open={state.status === "gameOver"}
        score={state.score}
        bestScore={Math.max(bestScore, state.bestScore)}
        level={state.level}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
}
