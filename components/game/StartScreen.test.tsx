// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StartScreen } from "./StartScreen";

function successfulLeaderboard(): Promise<Response> {
  return Promise.resolve(
    new Response(JSON.stringify({ entries: [] }), { status: 200 }),
  );
}

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
  vi.stubGlobal("fetch", vi.fn(successfulLeaderboard));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("StartScreen local start", () => {
  it("starts with a valid name when the CTA is clicked", () => {
    const onStart = vi.fn();
    render(<StartScreen bestScore={0} onStart={onStart} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "أحمد" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ابدأ اللعب" }));

    expect(onStart).toHaveBeenCalledWith("أحمد");
    expect(localStorage.getItem("khareef_player_name")).toBe("أحمد");
  });

  it("starts through the same handler when Enter is pressed", () => {
    const onStart = vi.fn();
    render(<StartScreen bestScore={0} onStart={onStart} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "سالم" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onStart).toHaveBeenCalledWith("سالم");
  });

  it("keeps a blank name on StartScreen and shows validation", () => {
    const onStart = vi.fn();
    render(<StartScreen bestScore={0} onStart={onStart} />);

    fireEvent.click(screen.getByRole("button", { name: "ابدأ اللعب" }));

    expect(onStart).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "اكتب اسمك عشان تبدأ",
    );
  });

  it("starts while the leaderboard request is still pending", () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => undefined));
    const onStart = vi.fn();
    render(<StartScreen bestScore={0} onStart={onStart} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "مريم" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ابدأ اللعب" }));

    expect(onStart).toHaveBeenCalledWith("مريم");
  });

  it("starts when the leaderboard returns 503", () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 503 }));
    const onStart = vi.fn();
    render(<StartScreen bestScore={0} onStart={onStart} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "ناصر" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ابدأ اللعب" }));

    expect(onStart).toHaveBeenCalledWith("ناصر");
  });

  it("allows only one local transition on a double click", () => {
    const onStart = vi.fn();
    render(<StartScreen bestScore={0} onStart={onStart} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "خالد" },
    });
    const button = screen.getByRole("button", { name: "ابدأ اللعب" });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(onStart).toHaveBeenCalledOnce();
  });

  it("never sends a leaderboard POST when starting", () => {
    render(<StartScreen bestScore={0} onStart={vi.fn()} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "علي" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ابدأ اللعب" }));

    const methods = vi.mocked(fetch).mock.calls.map(([, options]) =>
      options?.method?.toUpperCase(),
    );
    expect(methods).not.toContain("POST");
  });
});
