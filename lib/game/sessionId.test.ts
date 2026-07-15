import { describe, expect, it, vi } from "vitest";

import { createGameSessionId } from "./sessionId";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;

describe("createGameSessionId", () => {
  it("uses native randomUUID when available", () => {
    const randomUUID = vi
      .fn()
      .mockReturnValue("550e8400-e29b-41d4-a716-446655440000");

    expect(
      createGameSessionId({
        randomUUID,
        getRandomValues: vi.fn(),
      } as unknown as Crypto),
    ).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(randomUUID).toHaveBeenCalledOnce();
  });

  it("uses getRandomValues when randomUUID is unavailable", () => {
    const getRandomValues = vi.fn((bytes: Uint8Array) => {
      bytes.set(Array.from({ length: 16 }, (_, index) => index));
      return bytes;
    });

    const id = createGameSessionId({
      getRandomValues,
    } as unknown as Crypto);

    expect(id).toMatch(UUID_V4);
    expect(getRandomValues).toHaveBeenCalledOnce();
  });

  it("falls back safely when native session generation fails", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const getRandomValues = vi.fn((bytes: Uint8Array) => {
      bytes.fill(7);
      return bytes;
    });

    const id = createGameSessionId({
      randomUUID: () => {
        throw new Error("unsupported context");
      },
      getRandomValues,
    } as unknown as Crypto);

    expect(id).toMatch(UUID_V4);
    expect(getRandomValues).toHaveBeenCalledOnce();
    expect(consoleError).toHaveBeenCalledWith(
      "[game] Native session ID generation failed; using a local fallback.",
      "unsupported context",
    );
  });

  it("still returns a UUID when Web Crypto is unavailable", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(createGameSessionId(null)).toMatch(UUID_V4);
    expect(consoleError).toHaveBeenCalled();
  });
});
