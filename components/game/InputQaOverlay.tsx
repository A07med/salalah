"use client";

import type { Point } from "@/lib/game/types";

interface InputQaOverlayProps {
  clientPoint: Point | null;
  localPoint: Point | null;
  cleaverAnchor: Point | null;
  impactPoint: Point | null;
  crackCentre: Point | null;
}

function Crosshair({
  point,
  color,
  label,
}: {
  point: Point;
  color: string;
  label: string;
}) {
  const size = 7;
  return (
    <g data-qa={`qa-crosshair-${label}`}>
      <line
        x1={point.x - size}
        y1={point.y}
        x2={point.x + size}
        y2={point.y}
        stroke={color}
        strokeWidth="2"
      />
      <line
        x1={point.x}
        y1={point.y - size}
        x2={point.x}
        y2={point.y + size}
        stroke={color}
        strokeWidth="2"
      />
      <circle cx={point.x} cy={point.y} r="2.5" fill={color} />
      <text
        x={point.x + 10}
        y={point.y - 8}
        fill={color}
        fontSize="10"
        fontFamily="monospace"
      >
        {label}
      </text>
    </g>
  );
}

export function InputQaOverlay({
  clientPoint,
  localPoint,
  cleaverAnchor,
  impactPoint,
  crackCentre,
}: InputQaOverlayProps) {
  return (
    <div
      data-qa="input-qa-overlay"
      className="pointer-events-none absolute inset-0 z-[60]"
    >
      <svg className="h-full w-full">
        {clientPoint && (
          <Crosshair point={clientPoint} color="#00BFFF" label="client" />
        )}
        {localPoint && (
          <Crosshair point={localPoint} color="#32CD32" label="local" />
        )}
        {cleaverAnchor && (
          <Crosshair point={cleaverAnchor} color="#FF8C00" label="blade" />
        )}
        {impactPoint && (
          <Crosshair point={impactPoint} color="#FF1493" label="impact" />
        )}
        {crackCentre && (
          <Crosshair point={crackCentre} color="#9400D3" label="crack" />
        )}
      </svg>
      <div className="absolute left-2 top-20 rounded bg-black/70 px-2 py-1 font-mono text-[10px] text-white">
        {clientPoint && (
          <div>
            client: {Math.round(clientPoint.x)},{Math.round(clientPoint.y)}
          </div>
        )}
        {localPoint && (
          <div>
            local: {Math.round(localPoint.x)},{Math.round(localPoint.y)}
          </div>
        )}
      </div>
    </div>
  );
}

export function isInputQaEnabled(): boolean {
  return process.env.NEXT_PUBLIC_INPUT_QA === "1";
}
