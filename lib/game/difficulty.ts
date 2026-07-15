import type { DifficultyConfig } from "./types";

export function calculateDifficulty(level: number): DifficultyConfig {
  const base: DifficultyConfig = {
    swingSpeed: 2.8,
    swingAmplitude: 12,
    coconutScale: 1,
    damageMultiplier: 1,
    maxMisses: 5,
    windGusts: false,
  };

  if (level >= 2) {
    base.swingSpeed = 2.2;
    base.swingAmplitude = 15;
  }
  if (level >= 3) {
    base.swingSpeed = 1.8;
    base.swingAmplitude = 18;
    base.coconutScale = 0.9;
    base.damageMultiplier = 0.85;
    base.maxMisses = 4;
  }
  if (level >= 4) {
    base.swingSpeed = 1.5;
    base.swingAmplitude = 20;
    base.damageMultiplier = 0.75;
    base.windGusts = true;
  }
  if (level >= 5) {
    base.swingSpeed = 1.2;
    base.swingAmplitude = 22;
    base.coconutScale = 0.85;
    base.damageMultiplier = 0.65;
    base.maxMisses = 3;
  }

  return base;
}
