"use client";

import { useId, useMemo } from "react";
import type { MishliHitMark } from "@/lib/game/types";
import { MISHLI_BODY_PATH, MISHLI_INK } from "./mishliPaths";

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function crackPaths(
  mark: MishliHitMark,
  cx: number,
  cy: number,
): { main: string; branches: string[] } {
  const h = hashId(mark.id);
  const spread = 10 + (h % 8);
  const lean = ((h % 17) - 8) * 0.4;
  const depth = 14 + mark.strength * 6 + (h % 6);

  const main = `M${cx} ${cy} L${cx + lean} ${cy + depth * 0.35} L${cx - spread * 0.25} ${cy + depth * 0.7} L${cx + spread * 0.2} ${cy + depth}`;

  const branches: string[] = [];
  const branchCount = 2 + (h % 3);
  for (let i = 0; i < branchCount; i += 1) {
    const t = 0.35 + (i * 0.22);
    const bx = cx + lean * t + ((h >> (i + 1)) % 7) - 3;
    const by = cy + depth * t;
    const len = 6 + ((h >> (i + 3)) % 5);
    const dir = i % 2 === 0 ? -1 : 1;
    branches.push(
      `M${bx} ${by} L${bx + dir * len * 0.55} ${by + len * 0.35}`,
    );
  }

  return { main, branches };
}

interface MishliCrackLayerProps {
  marks: MishliHitMark[];
  className?: string;
}

export function MishliCrackLayer({ marks, className = "" }: MishliCrackLayerProps) {
  const uid = useId().replace(/:/g, "");
  const clipId = `mishli-body-clip-${uid}`;

  const rendered = useMemo(
    () =>
      marks.map((mark) => {
        const cx = mark.x * 112;
        const cy = mark.y * 136;
        const paths = crackPaths(mark, cx, cy);
        const opacity = Math.min(1, 0.72 + mark.strength * 0.14);
        const width = 2.8 + mark.strength * 0.55;
        return { mark, paths, opacity, width, cx, cy };
      }),
    [marks],
  );

  if (rendered.length === 0) return null;

  return (
    <svg
      viewBox="0 0 112 136"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <path d={MISHLI_BODY_PATH} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {rendered.map(({ mark, paths, opacity, width, cx, cy }) => (
          <g
            key={mark.id}
            className="animate-crack-appear"
            data-qa-crack-centre={`${mark.x.toFixed(3)},${mark.y.toFixed(3)}`}
            transform={`rotate(${mark.angle - 90} ${cx} ${cy})`}
          >
            <path
              d={paths.main}
              fill="none"
              stroke={MISHLI_INK}
              strokeWidth={width}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
            />
            {paths.branches.map((branch, i) => (
              <path
                key={`${mark.id}-b-${i}`}
                d={branch}
                fill="none"
                stroke="#4A6B32"
                strokeWidth={width - 0.6}
                strokeLinecap="round"
                opacity={opacity * 0.85}
              />
            ))}
            <circle
              cx={cx}
              cy={cy}
              r="1.2"
              fill="#2D1C15"
              opacity={opacity * 0.6}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
