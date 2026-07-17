import { MAX_FRUIT_SCORE } from "@/lib/game/scoreVersion";

/** Pale / desaturated Mishli green for weak successful cuts. */
export const WEAK_MISHLI_GREEN = "#C8D3A7";

/** Full-size table Mishli body green — perfect cuts. */
export const PERFECT_MISHLI_GREEN = "#6B8F3C";


/** Neutral pending / missed base fill. */
export const NEUTRAL_MISHLI_FILL = "#E8E0D0";

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function parseHex(hex: string): [number, number, number] {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function toHex(channel: number): string {
  return Math.round(channel).toString(16).padStart(2, "0");
}

/** Deterministic RGB lerp — no CSS color-mix dependency. */
export function interpolateRgb(from: string, to: string, t: number): string {
  const amount = clamp01(t);
  const [r1, g1, b1] = parseHex(from);
  const [r2, g2, b2] = parseHex(to);
  return `#${toHex(r1 + (r2 - r1) * amount)}${toHex(g1 + (g2 - g1) * amount)}${toHex(b1 + (b2 - b1) * amount)}`.toUpperCase();
}

export function getMishliAccuracyColor(score: number): string {
  const t = clamp01(score / MAX_FRUIT_SCORE);
  if (t <= 0) return WEAK_MISHLI_GREEN;
  if (t >= 1) return PERFECT_MISHLI_GREEN;
  return interpolateRgb(WEAK_MISHLI_GREEN, PERFECT_MISHLI_GREEN, t).toUpperCase();
}
