"use client";

import { MountainLayer } from "./MountainLayer";
import { MistLayer } from "./MistLayer";
import { RainEffect } from "./RainEffect";
import { PalmCanopy } from "./PalmCanopy";

interface KhareefBackgroundProps {
  showPalm?: boolean;
  rainDensity?: number;
  className?: string;
}

export function KhareefBackground({
  showPalm = true,
  rainDensity = 42,
  className = "",
}: KhareefBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#7aaf88_0%,#3d7a5a_28%,#1f4f38_58%,#163d2c_82%,#0f2a1e_100%)]" />

      {/* Soft overcast veil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(168,213,186,0.35)_0%,transparent_55%)]" />

      <MountainLayer />
      <MistLayer />
      <RainEffect density={rainDensity} />
      {showPalm && <PalmCanopy />}
    </div>
  );
}
