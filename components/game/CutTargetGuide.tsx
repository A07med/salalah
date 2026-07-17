"use client";

import type { CutTarget } from "@/lib/game/cutTargets";

interface CutTargetGuideProps {
  target: CutTarget;
  className?: string;
}

/**
 * Painted chalk-style cutting guide. Scales with the fruit via percentage layout.
 */
export function CutTargetGuide({ target, className = "" }: CutTargetGuideProps) {
  const length = 58;
  const rad = (target.angleDeg * Math.PI) / 180;
  const dx = Math.cos(rad) * (length / 2);
  const dy = Math.sin(rad) * (length / 2);

  return (
    <div
      data-qa="cut-target"
      className={`pointer-events-none absolute inset-0 z-[5] ${className}`}
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Soft chalk understroke */}
        <line
          x1={target.nx * 100 - dx}
          y1={target.ny * 100 - dy}
          x2={target.nx * 100 + dx}
          y2={target.ny * 100 + dy}
          stroke="#F4E4C1"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeDasharray="6 5"
          opacity="0.55"
        />
        {/* Painted guide stroke */}
        <line
          x1={target.nx * 100 - dx}
          y1={target.ny * 100 - dy}
          x2={target.nx * 100 + dx}
          y2={target.ny * 100 + dy}
          stroke="#FFF8E7"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray="6 5"
          opacity="0.88"
        />
        <line
          x1={target.nx * 100 - dx}
          y1={target.ny * 100 - dy}
          x2={target.nx * 100 + dx}
          y2={target.ny * 100 + dy}
          stroke="#2D1C15"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeDasharray="6 5"
          opacity="0.4"
        />
        {/* Chalk blot — not a laser reticule */}
        <circle
          cx={target.nx * 100}
          cy={target.ny * 100}
          r="2.6"
          fill="#C45C26"
          stroke="#2D1C15"
          strokeWidth="0.9"
          opacity="0.72"
        />
      </svg>
    </div>
  );
}
