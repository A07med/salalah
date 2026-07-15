// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Home from "./page";

vi.mock("@/components/game/GameStage", () => ({
  GameStage: ({
    playerName,
    sessionId,
  }: {
    playerName: string;
    sessionId: string;
  }) => (
    <div data-qa="game-stage" data-session-id={sessionId}>
      {playerName}
    </div>
  ),
}));

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    "requestAnimationFrame",
    (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    },
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ entries: [] }), { status: 200 }),
    ),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function enterName(name: string): HTMLElement {
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: name } });
  return input;
}

describe("Home start transition", () => {
  it("opens GameStage immediately after a valid click", () => {
    render(<Home />);
    enterName("أحمد");

    fireEvent.click(screen.getByRole("button", { name: "ابدأ اللعب" }));

    const stage = screen.getByText("أحمد");
    expect(stage).toHaveAttribute("data-qa", "game-stage");
    expect(stage.getAttribute("data-session-id")).toMatch(
      /^[0-9a-f-]{36}$/u,
    );
  });

  it("opens GameStage immediately after Enter", () => {
    render(<Home />);
    const input = enterName("سالم");

    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText("سالم")).toHaveAttribute(
      "data-qa",
      "game-stage",
    );
  });

  it("does not let a database-unavailable response block gameplay", () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 503 }));
    render(<Home />);
    enterName("مريم");

    fireEvent.click(screen.getByRole("button", { name: "ابدأ اللعب" }));

    expect(screen.getByText("مريم")).toHaveAttribute(
      "data-qa",
      "game-stage",
    );
    expect(
      vi.mocked(fetch).mock.calls.some(([, options]) => options?.method === "POST"),
    ).toBe(false);
  });
});
