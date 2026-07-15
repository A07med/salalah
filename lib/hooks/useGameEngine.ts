"use client";

import { useCallback, useReducer } from "react";
import {
  getSegmentImpactPoint,
  lineIntersectsRect,
} from "@/lib/game/collision";
import { swipeAngleDeg } from "@/lib/game/coordinates";
import { calculateDifficulty } from "@/lib/game/difficulty";
import { addHitMark, normalizeImpactToMark } from "@/lib/game/hitMarks";
import {
  calculateCutDamage,
  calculateLevelCompleteBonus,
  calculateMissPenalty,
  calculateSlashScore,
} from "@/lib/game/scoring";
import { getLocalBestScore, saveLocalBestScore } from "@/lib/game/storage";
import type { GameAction, GameState, Point } from "@/lib/game/types";

function applyDifficulty(state: GameState, level: number): GameState {
  const config = calculateDifficulty(level);
  return {
    ...state,
    level,
    cutProgress: 0,
    missCount: 0,
    maxMisses: config.maxMisses,
    swingAmplitude: config.swingAmplitude,
    swingSpeed: config.swingSpeed,
    coconutScale: config.coconutScale,
    isDropping: false,
    activeSlash: null,
    slashLines: [],
    lastCutQuality: null,
    lastDamage: 0,
    lastHitPoint: null,
    lastSwipeAngle: 0,
    mishliHitMarks: [],
    levelCompleteBonus: 0,
  };
}

function createInitialState(): GameState {
  const config = calculateDifficulty(1);
  return {
    status: "idle",
    level: 1,
    score: 0,
    cutProgress: 0,
    missCount: 0,
    maxMisses: config.maxMisses,
    swingAmplitude: config.swingAmplitude,
    swingSpeed: config.swingSpeed,
    coconutScale: config.coconutScale,
    slashLines: [],
    activeSlash: null,
    isDropping: false,
    lastCutQuality: null,
    lastDamage: 0,
    lastHitPoint: null,
    lastSwipeAngle: 0,
    mishliHitMarks: [],
    cutFeedbackKey: 0,
    bestScore: 0,
    levelCompleteBonus: 0,
  };
}

function midPoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME": {
      const fresh = applyDifficulty(createInitialState(), 1);
      return {
        ...fresh,
        status: "playing",
        score: 0,
        bestScore: getLocalBestScore(),
      };
    }

    case "RESET_TO_IDLE":
      return {
        ...createInitialState(),
        bestScore: getLocalBestScore(),
      };

    case "POINTER_DOWN":
      if (state.status !== "playing" || state.isDropping) return state;
      return {
        ...state,
        activeSlash: { start: action.point, end: action.point },
      };

    case "POINTER_MOVE":
      if (!state.activeSlash || state.status !== "playing") return state;
      return {
        ...state,
        activeSlash: { ...state.activeSlash, end: action.point },
      };

    case "POINTER_UP": {
      if (!state.activeSlash || state.status !== "playing" || state.isDropping) {
        return { ...state, activeSlash: null };
      }

      const { start } = state.activeSlash;
      const end = action.point;
      const config = calculateDifficulty(state.level);
      const feedbackKey = state.cutFeedbackKey + 1;
      const angle = swipeAngleDeg(start, end);

      if (!action.coconutRect) {
        return {
          ...state,
          activeSlash: null,
          missCount: state.missCount + 1,
          lastCutQuality: "miss",
          lastDamage: 0,
          lastHitPoint: midPoint(start, end),
          lastSwipeAngle: angle,
          cutFeedbackKey: feedbackKey,
          score: Math.max(0, state.score - calculateMissPenalty()),
          status:
            state.missCount + 1 >= state.maxMisses ? "gameOver" : state.status,
        };
      }

      const hit = lineIntersectsRect(start, end, action.coconutRect);

      if (!hit) {
        const newMissCount = state.missCount + 1;
        const gameOver = newMissCount >= state.maxMisses;
        const nextState: GameState = {
          ...state,
          activeSlash: null,
          missCount: newMissCount,
          lastCutQuality: "miss",
          lastDamage: 0,
          lastHitPoint: midPoint(start, end),
          lastSwipeAngle: angle,
          cutFeedbackKey: feedbackKey,
          score: Math.max(0, state.score - calculateMissPenalty()),
          status: gameOver ? "gameOver" : state.status,
        };
        if (gameOver) {
          nextState.bestScore = saveLocalBestScore(nextState.score);
        }
        return nextState;
      }

      const { damage, quality } = calculateCutDamage(
        start,
        end,
        action.coconutRect,
        config.damageMultiplier,
      );
      const impactPoint = getSegmentImpactPoint(start, end, action.coconutRect);
      const newProgress = Math.min(100, state.cutProgress + damage);
      const slashScore = calculateSlashScore(damage, state.level, quality);

      let mishliHitMarks = state.mishliHitMarks;
      if (impactPoint && action.fruitBodyRect) {
        const mark = normalizeImpactToMark(
          impactPoint,
          action.fruitBodyRect,
          angle,
          String(feedbackKey),
        );
        mishliHitMarks = addHitMark(state.mishliHitMarks, mark);
      }

      const hitPoint = impactPoint ?? midPoint(start, end);

      if (newProgress >= 100) {
        const bonus = calculateLevelCompleteBonus(state.level);
        return {
          ...state,
          activeSlash: null,
          cutProgress: 100,
          score: state.score + slashScore + bonus,
          lastCutQuality: quality,
          lastDamage: damage,
          lastHitPoint: hitPoint,
          lastSwipeAngle: angle,
          mishliHitMarks,
          cutFeedbackKey: feedbackKey,
          status: "levelComplete",
          isDropping: true,
          levelCompleteBonus: bonus,
        };
      }

      return {
        ...state,
        activeSlash: null,
        cutProgress: newProgress,
        score: state.score + slashScore,
        lastCutQuality: quality,
        lastDamage: damage,
        lastHitPoint: hitPoint,
        lastSwipeAngle: angle,
        mishliHitMarks,
        cutFeedbackKey: feedbackKey,
      };
    }

    case "NEXT_LEVEL": {
      const nextLevel = state.level + 1;
      return {
        ...applyDifficulty(state, nextLevel),
        status: "playing",
        score: state.score,
        bestScore: state.bestScore,
        cutFeedbackKey: state.cutFeedbackKey,
      };
    }

    case "DROP_COMPLETE":
      return { ...state, isDropping: false };

    case "CLEAR_SLASH_LINES":
      return { ...state, slashLines: [] };

    default:
      return state;
  }
}

export function useGameEngine() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);

  const startGame = useCallback(() => dispatch({ type: "START_GAME" }), []);
  const resetToIdle = useCallback(() => dispatch({ type: "RESET_TO_IDLE" }), []);
  const nextLevel = useCallback(() => dispatch({ type: "NEXT_LEVEL" }), []);
  const dropComplete = useCallback(() => dispatch({ type: "DROP_COMPLETE" }), []);
  const clearSlashLines = useCallback(
    () => dispatch({ type: "CLEAR_SLASH_LINES" }),
    [],
  );

  const handlePointerDown = useCallback((point: Point) => {
    dispatch({ type: "POINTER_DOWN", point });
  }, []);

  const handlePointerMove = useCallback((point: Point) => {
    dispatch({ type: "POINTER_MOVE", point });
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

  const finishGameOver = useCallback(() => {
    return saveLocalBestScore(state.score);
  }, [state.score]);

  return {
    state,
    startGame,
    resetToIdle,
    nextLevel,
    dropComplete,
    clearSlashLines,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    finishGameOver,
  };
}
