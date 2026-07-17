"use client";

import { useCallback, useReducer } from "react";
import {
  getSegmentImpactPoint,
  getSwipeLength,
  lineIntersectsRect,
} from "@/lib/game/collision";
import { swipeAngleDeg } from "@/lib/game/coordinates";
import { getFruitTarget } from "@/lib/game/cutTargets";
import {
  calculateFruitScore,
  getQualityLabel,
} from "@/lib/game/fruitScore";
import { normalizeImpactToMark } from "@/lib/game/hitMarks";
import { MIN_SWIPE_LENGTH } from "@/lib/game/constants";
import { ATTEMPTS_PER_RUN } from "@/lib/game/scoreVersion";
import { getLocalBestScore, saveLocalBestScore } from "@/lib/game/storage";
import type {
  AttemptIndex,
  GameAction,
  GameState,
  Point,
} from "@/lib/game/types";

function createInitialState(): GameState {
  return {
    status: "idle",
    phase: "ready",
    attemptIndex: 0,
    attemptScores: [],
    totalScore: 0,
    successfulHits: 0,
    mistakes: 0,
    coconutScale: 1,
    activeSlash: null,
    isDropping: false,
    lastFruitScore: 0,
    lastQualityLabel: "",
    lastHitPoint: null,
    lastSwipeAngle: 0,
    mishliHitMarks: [],
    cutFeedbackKey: 0,
    bestScore: 0,
  };
}

function midPoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME":
      return {
        ...createInitialState(),
        status: "playing",
        phase: "ready",
        bestScore: getLocalBestScore(),
      };

    case "RESET_TO_IDLE":
      return {
        ...createInitialState(),
        bestScore: getLocalBestScore(),
      };

    case "POINTER_DOWN":
      if (
        state.status !== "playing" ||
        state.phase !== "ready" ||
        state.isDropping
      ) {
        return state;
      }
      return {
        ...state,
        activeSlash: { start: action.point, end: action.point },
      };

    case "POINTER_MOVE":
      if (!state.activeSlash || state.phase !== "ready") return state;
      return {
        ...state,
        activeSlash: { ...state.activeSlash, end: action.point },
      };

    case "POINTER_CANCEL":
      return { ...state, activeSlash: null };

    case "POINTER_UP": {
      if (
        !state.activeSlash ||
        state.status !== "playing" ||
        state.phase !== "ready" ||
        state.isDropping
      ) {
        return { ...state, activeSlash: null };
      }

      const { start } = state.activeSlash;
      const end = action.point;
      const length = getSwipeLength(start, end);

      // Tiny taps / accidental jitter must not consume an attempt.
      if (length < MIN_SWIPE_LENGTH) {
        return { ...state, activeSlash: null };
      }

      const angle = swipeAngleDeg(start, end);
      const feedbackKey = state.cutFeedbackKey + 1;
      const target = getFruitTarget(state.attemptIndex);
      const hit =
        Boolean(action.coconutRect) &&
        lineIntersectsRect(start, end, action.coconutRect!);

      const impactPoint = hit
        ? getSegmentImpactPoint(start, end, action.coconutRect!)
        : null;

      const breakdown = calculateFruitScore({
        start,
        end,
        fruitRect: action.coconutRect ?? new DOMRect(),
        target,
        impactPoint,
        hit,
      });

      const fruitScore = breakdown.score;
      const nextScores = [...state.attemptScores, fruitScore];
      const hitPoint = impactPoint ?? midPoint(start, end);

      let mishliHitMarks = state.mishliHitMarks;
      if (hit && impactPoint && action.fruitBodyRect) {
        mishliHitMarks = [
          normalizeImpactToMark(
            impactPoint,
            action.fruitBodyRect,
            angle,
            String(feedbackKey),
          ),
        ];
      } else {
        mishliHitMarks = [];
      }

      return {
        ...state,
        activeSlash: null,
        phase: "resolving-attempt",
        attemptScores: nextScores,
        totalScore: nextScores.reduce((sum, value) => sum + value, 0),
        successfulHits: state.successfulHits + (fruitScore > 0 ? 1 : 0),
        mistakes: state.mistakes + (fruitScore === 0 ? 1 : 0),
        isDropping: hit,
        lastFruitScore: fruitScore,
        lastQualityLabel: getQualityLabel(fruitScore),
        lastHitPoint: hitPoint,
        lastSwipeAngle: angle,
        mishliHitMarks,
        cutFeedbackKey: feedbackKey,
      };
    }

    case "ADVANCE_AFTER_FEEDBACK": {
      if (
        state.status !== "playing" ||
        (state.phase !== "resolving-attempt" &&
          state.phase !== "showing-result")
      ) {
        return state;
      }

      if (state.attemptScores.length >= ATTEMPTS_PER_RUN) {
        return {
          ...state,
          status: "runComplete",
          phase: "run-complete",
          isDropping: false,
          activeSlash: null,
          mishliHitMarks: [],
        };
      }

      const nextIndex = state.attemptScores.length as AttemptIndex;
      return {
        ...state,
        phase: "ready",
        attemptIndex: nextIndex,
        isDropping: false,
        activeSlash: null,
        mishliHitMarks: [],
        lastHitPoint: null,
        lastFruitScore: 0,
        lastQualityLabel: "",
      };
    }

    case "DROP_COMPLETE":
      if (state.phase === "resolving-attempt") {
        return {
          ...state,
          isDropping: false,
          phase: "showing-result",
        };
      }
      return { ...state, isDropping: false };

    default:
      return state;
  }
}

export function useGameEngine() {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialState,
  );

  const startGame = useCallback(() => dispatch({ type: "START_GAME" }), []);
  const resetToIdle = useCallback(
    () => dispatch({ type: "RESET_TO_IDLE" }),
    [],
  );
  const dropComplete = useCallback(
    () => dispatch({ type: "DROP_COMPLETE" }),
    [],
  );
  const advanceAfterFeedback = useCallback(
    () => dispatch({ type: "ADVANCE_AFTER_FEEDBACK" }),
    [],
  );

  const handlePointerDown = useCallback((point: Point) => {
    dispatch({ type: "POINTER_DOWN", point });
  }, []);

  const handlePointerMove = useCallback((point: Point) => {
    dispatch({ type: "POINTER_MOVE", point });
  }, []);

  const handlePointerCancel = useCallback(() => {
    dispatch({ type: "POINTER_CANCEL" });
  }, []);

  const handlePointerUp = useCallback(
    (
      point: Point,
      coconutRect: DOMRect | null,
      fruitBodyRect: DOMRect | null,
    ) => {
      dispatch({
        type: "POINTER_UP",
        point,
        coconutRect,
        fruitBodyRect,
      });
    },
    [],
  );

  const finishRun = useCallback(() => {
    return saveLocalBestScore(state.totalScore);
  }, [state.totalScore]);

  return {
    state,
    startGame,
    resetToIdle,
    dropComplete,
    advanceAfterFeedback,
    handlePointerDown,
    handlePointerMove,
    handlePointerCancel,
    handlePointerUp,
    finishRun,
  };
}
