// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GameStage } from "./GameStage";

vi.mock("@/lib/leaderboard/client", () => ({
  shouldSubmitGameResult: () => false,
  submitGameResultOnce: vi.fn(),
}));

function rect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("PointerEvent", MouseEvent);
  vi.stubGlobal(
    "requestAnimationFrame",
    (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    },
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );

  Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", {
    configurable: true,
    value: vi.fn(() => true),
  });
  Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", {
    configurable: true,
    value: vi.fn(),
  });

  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function getTestRect(this: HTMLElement) {
      const qa = this.getAttribute("data-qa");
      if (qa === "game-stage") return rect(0, 0, 390, 844);
      if (qa === "cutting-zone" || qa === "chopping-board") {
        return rect(47, 420, 296, 258);
      }
      if (qa === "fruit-body") return rect(101, 435, 188, 220);
      if (qa === "coconut-hitbox") return rect(116, 453, 158, 193);
      return rect(0, 0, 0, 0);
    },
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function renderStage() {
  return render(
    <GameStage
      playerName="اختبار"
      sessionId="550e8400-e29b-41d4-a716-446655440000"
      onExit={vi.fn()}
    />,
  );
}

describe("GameStage real pointer surface", () => {
  it("shows tap guidance without consuming an attempt", () => {
    const { container } = renderStage();
    const zone = container.querySelector(
      "[data-qa=cutting-zone]",
    ) as HTMLElement;

    fireEvent.pointerDown(zone, {
      pointerId: 1,
      pointerType: "mouse",
      clientX: 150,
      clientY: 520,
    });
    fireEvent.pointerUp(zone, {
      pointerId: 1,
      pointerType: "mouse",
      clientX: 150,
      clientY: 520,
    });

    expect(screen.getByText("اسحب الساطور، لا تنقر فقط")).toBeVisible();
    expect(
      container.querySelector("[data-qa=game-stage]"),
    ).toHaveAttribute("data-attempt-count", "0");
    expect(
      container.querySelector("[data-qa=mini-mishli-0]"),
    ).toHaveAttribute("data-state", "pending");
  });

  it("restarts one tap-feedback timer instead of stacking timers", () => {
    const { container } = renderStage();
    const zone = container.querySelector(
      "[data-qa=cutting-zone]",
    ) as HTMLElement;

    const tap = () => {
      fireEvent.pointerDown(zone, {
        pointerId: 1,
        pointerType: "touch",
        clientX: 150,
        clientY: 520,
      });
      fireEvent.pointerUp(zone, {
        pointerId: 1,
        pointerType: "touch",
        clientX: 150,
        clientY: 520,
      });
    };

    tap();
    act(() => vi.advanceTimersByTime(700));
    tap();
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("اسحب الساطور، لا تنقر فقط")).toBeVisible();
    act(() => vi.advanceTimersByTime(500));
    expect(
      screen.queryByText("اسحب الساطور، لا تنقر فقط"),
    ).not.toBeInTheDocument();
  });

  it("resolves a board-to-board drag and hides the tutorial", () => {
    const { container } = renderStage();
    const zone = container.querySelector(
      "[data-qa=cutting-zone]",
    ) as HTMLElement;

    fireEvent.pointerDown(zone, {
      pointerId: 2,
      pointerType: "mouse",
      clientX: 55,
      clientY: 540,
    });
    fireEvent.pointerMove(zone, {
      pointerId: 2,
      pointerType: "mouse",
      clientX: 195,
      clientY: 540,
    });
    fireEvent.pointerUp(zone, {
      pointerId: 2,
      pointerType: "mouse",
      clientX: 335,
      clientY: 540,
    });

    expect(
      container.querySelector("[data-qa=game-stage]"),
    ).toHaveAttribute("data-attempt-count", "1");
    expect(
      container.querySelector("[data-qa=mini-mishli-0]"),
    ).toHaveAttribute("data-state", "hit");
    expect(
      screen.queryByText(
        "اسحب الساطور على علامة القطع — اضغط واسحب عبر الخط.",
      ),
    ).not.toBeInTheDocument();
    expect(
      HTMLElement.prototype.setPointerCapture,
    ).toHaveBeenCalledTimes(1);
    expect(
      HTMLElement.prototype.releasePointerCapture,
    ).toHaveBeenCalledTimes(1);
  });
});
