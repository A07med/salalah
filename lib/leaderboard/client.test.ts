import { describe, expect, it, vi } from "vitest";

import {
  shouldSubmitGameResult,
  submitGameResultOnce,
  submitGameScoreFromClient,
} from "./client";
import type { GameScoreSubmission } from "./types";

const result: GameScoreSubmission = {
  sessionId: "550e8400-e29b-41d4-a716-446655440000",
  playerName: "أحمد العبري",
  score: 5960,
  levelReached: 4,
  successfulHits: 28,
  mistakes: 1,
  durationMs: 83_000,
};

describe("client score submission", () => {
  it("submits only terminal run events, never level completion", () => {
    expect(shouldSubmitGameResult("gameOver", 100)).toBe(true);
    expect(shouldSubmitGameResult("exit", 100)).toBe(true);
    expect(shouldSubmitGameResult("levelComplete", 100)).toBe(false);
    expect(shouldSubmitGameResult("gameOver", 0)).toBe(false);
  });

  it("submits a game-over result exactly once", async () => {
    const submitter = vi.fn().mockResolvedValue({
      saved: true,
      enteredTopFive: true,
    });
    const submitted = new Set<string>();

    await submitGameResultOnce(result, submitted, submitter);
    await submitGameResultOnce(result, submitted, submitter);

    expect(submitter).toHaveBeenCalledTimes(1);
  });

  it("submits an exit result exactly once", async () => {
    const submitter = vi.fn().mockResolvedValue({
      saved: true,
      enteredTopFive: false,
    });

    await submitGameResultOnce(result, new Set(), submitter);
    expect(submitter).toHaveBeenCalledOnce();
  });

  it("does not submit zero-score runs", async () => {
    const submitter = vi.fn();
    await submitGameResultOnce(
      { ...result, score: 0 },
      new Set(),
      submitter,
    );
    expect(submitter).not.toHaveBeenCalled();
  });

  it("prevents Strict Mode-style duplicate execution", async () => {
    const submitter = vi.fn().mockResolvedValue(null);
    const submitted = new Set<string>();

    await Promise.all([
      submitGameResultOnce(result, submitted, submitter),
      submitGameResultOnce(result, submitted, submitter),
    ]);

    expect(submitter).toHaveBeenCalledOnce();
  });

  it("retries one transient network failure", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError("network"))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ saved: true, enteredTopFive: true }),
          { status: 201 },
        ),
      );

    await expect(
      submitGameScoreFromClient(result, fetchImpl),
    ).resolves.toEqual({ saved: true, enteredTopFive: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it.each([400, 409, 429])(
    "does not retry a %s response",
    async (status) => {
      const fetchImpl = vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(null, { status }));

      await submitGameScoreFromClient(result, fetchImpl);
      expect(fetchImpl).toHaveBeenCalledOnce();
    },
  );

  it("does not block navigation when submission fails", async () => {
    const navigate = vi.fn();
    const submitter = vi.fn().mockRejectedValue(new Error("offline"));

    const pending = submitGameResultOnce(result, new Set(), submitter);
    navigate();
    await expect(pending).resolves.toBeNull();

    expect(navigate).toHaveBeenCalledOnce();
  });
});
