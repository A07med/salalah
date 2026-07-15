type ClientCrypto = Pick<Crypto, "getRandomValues"> &
  Partial<Pick<Crypto, "randomUUID">>;

function formatUuidV4(bytes: Uint8Array): string {
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

function reportSessionIdFallback(error: unknown): void {
  if (process.env.NODE_ENV === "production") return;

  console.error(
    "[game] Native session ID generation failed; using a local fallback.",
    error instanceof Error ? error.message : "Unknown browser crypto error",
  );
}

function createLastResortBytes(): Uint8Array {
  const bytes = new Uint8Array(16);
  let seed = Date.now() ^ Math.floor(Math.random() * 0xffffffff);

  for (let index = 0; index < bytes.length; index += 1) {
    seed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b);
    bytes[index] = seed & 0xff;
  }

  return bytes;
}

/**
 * Creates a client-only UUID without network or database access.
 * `randomUUID` is restricted to secure contexts in some browsers, while
 * `getRandomValues` remains available on HTTP LAN development origins.
 */
export function createGameSessionId(
  cryptoSource: ClientCrypto | null | undefined = globalThis.crypto,
): string {
  if (typeof cryptoSource?.randomUUID === "function") {
    try {
      return cryptoSource.randomUUID();
    } catch (error) {
      reportSessionIdFallback(error);
    }
  }

  if (typeof cryptoSource?.getRandomValues === "function") {
    try {
      return formatUuidV4(
        cryptoSource.getRandomValues(new Uint8Array(16)),
      );
    } catch (error) {
      reportSessionIdFallback(error);
    }
  }

  reportSessionIdFallback(
    new Error("Web Crypto random values are unavailable"),
  );
  return formatUuidV4(createLastResortBytes());
}
