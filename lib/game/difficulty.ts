/**
 * @deprecated Level-based difficulty was removed with the three-Mishli run.
 * Kept as a no-op export so legacy scripts do not break at import time.
 */
export function calculateDifficulty(level: number) {
  void level;
  return {
    swingSpeed: 0,
    swingAmplitude: 0,
    coconutScale: 1,
    damageMultiplier: 1,
    maxMisses: 0,
    windGusts: false,
  };
}
