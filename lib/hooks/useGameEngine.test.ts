// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MIN_SWIPE_LENGTH } from "@/lib/game/constants";
import { useGameEngine } from "@/lib/hooks/useGameEngine";

function fruitRect(): DOMRect {
  return {
    left: 100,
    top: 100,
    right: 220,
    bottom: 240,
    width: 120,
    height: 140,
    x: 100,
    y: 100,
    toJSON: () => ({}),
  } as DOMRect;
}

describe("useGameEngine three-Mishli run", () => {
  it("does not consume an attempt for a tiny tap", () => {
    const { result } = renderHook(() => useGameEngine());
    act(() => result.current.startGame());

    act(() => {
      result.current.handlePointerDown({ x: 160, y: 170 });
      result.current.handlePointerUp(
        { x: 160 + MIN_SWIPE_LENGTH - 1, y: 170 },
        fruitRect(),
        fruitRect(),
      );
    });

    expect(result.current.state.attemptScores).toEqual([]);
    expect(result.current.state.attemptIndex).toBe(0);
    expect(result.current.state.phase).toBe("ready");
  });

  it("consumes exactly one attempt for a deliberate swipe", () => {
    const { result } = renderHook(() => useGameEngine());
    act(() => result.current.startGame());

    act(() => {
      result.current.handlePointerDown({ x: 90, y: 170 });
      result.current.handlePointerUp(
        { x: 230, y: 170 },
        fruitRect(),
        fruitRect(),
      );
    });

    expect(result.current.state.attemptScores).toHaveLength(1);
    expect(result.current.state.phase).toBe("resolving-attempt");
  });

  it("resolves a reverse-direction swipe through the same fruit", () => {
    const { result } = renderHook(() => useGameEngine());
    act(() => result.current.startGame());

    act(() => {
      result.current.handlePointerDown({ x: 230, y: 170 });
      result.current.handlePointerMove({ x: 160, y: 170 });
      result.current.handlePointerUp(
        { x: 90, y: 170 },
        fruitRect(),
        fruitRect(),
      );
    });

    expect(result.current.state.attemptScores).toHaveLength(1);
    expect(result.current.state.attemptScores[0]).toBeGreaterThan(0);
  });

  it("cancels a captured pointer without consuming an attempt", () => {
    const { result } = renderHook(() => useGameEngine());
    act(() => result.current.startGame());

    act(() => {
      result.current.handlePointerDown({ x: 90, y: 170 });
      result.current.handlePointerMove({ x: 160, y: 170 });
      result.current.handlePointerCancel();
    });

    expect(result.current.state.activeSlash).toBeNull();
    expect(result.current.state.attemptScores).toEqual([]);
    expect(result.current.state.phase).toBe("ready");
  });

  it("ignores a second swipe during feedback", () => {
    const { result } = renderHook(() => useGameEngine());
    act(() => result.current.startGame());

    act(() => {
      result.current.handlePointerDown({ x: 90, y: 170 });
      result.current.handlePointerUp(
        { x: 230, y: 170 },
        fruitRect(),
        fruitRect(),
      );
    });
    const first = [...result.current.state.attemptScores];

    act(() => {
      result.current.handlePointerDown({ x: 90, y: 170 });
      result.current.handlePointerUp(
        { x: 230, y: 200 },
        fruitRect(),
        fruitRect(),
      );
    });

    expect(result.current.state.attemptScores).toEqual(first);
  });

  it("advances to the next Mishli after a miss", () => {
    const { result } = renderHook(() => useGameEngine());
    act(() => result.current.startGame());

    act(() => {
      result.current.handlePointerDown({ x: 0, y: 0 });
      result.current.handlePointerUp(
        { x: 40, y: 0 },
        fruitRect(),
        fruitRect(),
      );
    });

    expect(result.current.state.attemptScores[0]).toBe(0);
    expect(result.current.state.isDropping).toBe(false);

    act(() => result.current.advanceAfterFeedback());

    expect(result.current.state.attemptIndex).toBe(1);
    expect(result.current.state.phase).toBe("ready");
  });

  it("finishes the run after the third attempt and never creates a fourth", () => {
    const { result } = renderHook(() => useGameEngine());
    act(() => result.current.startGame());

    for (let index = 0; index < 3; index += 1) {
      act(() => {
        result.current.handlePointerDown({ x: 90, y: 170 });
        result.current.handlePointerUp(
          { x: 230, y: 170 },
          fruitRect(),
          fruitRect(),
        );
      });
      act(() => result.current.advanceAfterFeedback());
    }

    expect(result.current.state.attemptScores).toHaveLength(3);
    expect(result.current.state.status).toBe("runComplete");
    expect(result.current.state.phase).toBe("run-complete");

    act(() => {
      result.current.handlePointerDown({ x: 90, y: 170 });
      result.current.handlePointerUp(
        { x: 230, y: 170 },
        fruitRect(),
        fruitRect(),
      );
    });

    expect(result.current.state.attemptScores).toHaveLength(3);
  });

  it("resolves a hit when pointer-up is outside the fruit after a crossing swipe", () => {
    const { result } = renderHook(() => useGameEngine());
    act(() => result.current.startGame());

    act(() => {
      result.current.handlePointerDown({ x: 80, y: 170 });
      result.current.handlePointerMove({ x: 160, y: 170 });
      // Release well outside the fruit — capture keeps the gesture valid.
      result.current.handlePointerUp(
        { x: 320, y: 40 },
        fruitRect(),
        fruitRect(),
      );
    });

    expect(result.current.state.attemptScores).toHaveLength(1);
    expect(result.current.state.attemptScores[0]).toBeGreaterThan(0);
    expect(result.current.state.isDropping).toBe(true);
  });

  it("unlocks input for the next Mishli after feedback", () => {
    const { result } = renderHook(() => useGameEngine());
    act(() => result.current.startGame());

    act(() => {
      result.current.handlePointerDown({ x: 90, y: 170 });
      result.current.handlePointerUp(
        { x: 230, y: 170 },
        fruitRect(),
        fruitRect(),
      );
    });
    expect(result.current.state.phase).toBe("resolving-attempt");

    act(() => result.current.advanceAfterFeedback());
    expect(result.current.state.phase).toBe("ready");
    expect(result.current.state.attemptIndex).toBe(1);

    act(() => {
      result.current.handlePointerDown({ x: 90, y: 170 });
      result.current.handlePointerUp(
        { x: 230, y: 170 },
        fruitRect(),
        fruitRect(),
      );
    });
    expect(result.current.state.attemptScores).toHaveLength(2);
  });

  it("consumes exactly one attempt for a miss", () => {
    const { result } = renderHook(() => useGameEngine());
    act(() => result.current.startGame());

    act(() => {
      result.current.handlePointerDown({ x: 0, y: 0 });
      result.current.handlePointerUp({ x: 50, y: 0 }, fruitRect(), fruitRect());
    });

    expect(result.current.state.attemptScores).toEqual([0]);
    expect(result.current.state.mistakes).toBe(1);
  });
});
