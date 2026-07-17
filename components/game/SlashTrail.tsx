"use client";

import { useEffect, useState } from "react";
import { SLASH_FADE_MS } from "@/lib/game/constants";
import type { Point } from "@/lib/game/types";

interface SlashLine {
  id: string;
  start: Point;
  end: Point;
  createdAt: number;
}

interface SlashTrailProps {
  slashLines: SlashLine[];
  activeSlash: { start: Point; end: Point } | null;
  onFadeComplete?: () => void;
}

export function SlashTrail({
  slashLines,
  activeSlash,
  onFadeComplete,
}: SlashTrailProps) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (slashLines.length === 0) return;
    const id = window.setInterval(() => setNow(performance.now()), 50);
    const clearId = window.setTimeout(() => {
      onFadeComplete?.();
    }, SLASH_FADE_MS + 50);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(clearId);
    };
  }, [slashLines, onFadeComplete]);

  return (
    <svg className="absolute inset-0 z-20 h-full w-full pointer-events-none">
      <defs>
        <filter id="slashGlowStrong" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="slashGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FACC15" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#FACC15" stopOpacity="1" />
          <stop offset="100%" stopColor="#FACC15" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {slashLines.map((line) => {
        const age = now - (line.createdAt ?? now);
        const life = Math.min(1, Math.max(0, 1 - age / SLASH_FADE_MS));

        return (
          <g key={line.id}>
            <line
              x1={line.start.x}
              y1={line.start.y}
              x2={line.end.x}
              y2={line.end.y}
              stroke="#EF3340"
              strokeWidth="3"
              strokeLinecap="round"
              opacity={0.45 * life}
            />
            <line
              x1={line.start.x}
              y1={line.start.y}
              x2={line.end.x}
              y2={line.end.y}
              stroke="#FFF8E7"
              strokeWidth="7"
              strokeLinecap="round"
              opacity={0.5 * life}
            />
            <line
              x1={line.start.x}
              y1={line.start.y}
              x2={line.end.x}
              y2={line.end.y}
              stroke="#F6C945"
              strokeWidth="5"
              strokeLinecap="round"
              opacity={0.85 * life}
            />
            <line
              x1={line.start.x}
              y1={line.start.y}
              x2={line.end.x}
              y2={line.end.y}
              stroke="#FFF8E7"
              strokeWidth="2"
              strokeLinecap="round"
              opacity={life}
            />
          </g>
        );
      })}

      {activeSlash && (
        <g>
          <line
            x1={activeSlash.start.x}
            y1={activeSlash.start.y}
            x2={activeSlash.end.x}
            y2={activeSlash.end.y}
            stroke="#EF3340"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.5"
          />
          <line
            x1={activeSlash.start.x}
            y1={activeSlash.start.y}
            x2={activeSlash.end.x}
            y2={activeSlash.end.y}
            stroke="#F6C945"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.75"
          />
          <line
            x1={activeSlash.start.x}
            y1={activeSlash.start.y}
            x2={activeSlash.end.x}
            y2={activeSlash.end.y}
            stroke="#FFF8E7"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.95"
          />
        </g>
      )}
    </svg>
  );
}
