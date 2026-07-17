export interface CutTarget {
  /** Normalized X of the guide centre on the fruit body (0–1). */
  nx: number;
  /** Normalized Y of the guide centre on the fruit body (0–1). */
  ny: number;
  /** Ideal cut-line angle in degrees (0 = horizontal right). */
  angleDeg: number;
}

/**
 * Deterministic target set so every player receives the same three challenges.
 * Coordinates stay inside the intact green husk.
 */
export const FRUIT_TARGETS: readonly [CutTarget, CutTarget, CutTarget] = [
  // Fruit 1 — central, nearly horizontal
  { nx: 0.5, ny: 0.5, angleDeg: 0 },
  // Fruit 2 — slightly above centre, mild diagonal
  { nx: 0.5, ny: 0.4, angleDeg: 22 },
  // Fruit 3 — slightly below centre, opposite mild diagonal
  { nx: 0.5, ny: 0.6, angleDeg: -22 },
];

export function getFruitTarget(attemptIndex: 0 | 1 | 2): CutTarget {
  return FRUIT_TARGETS[attemptIndex];
}
