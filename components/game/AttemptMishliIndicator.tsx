"use client";

import { getMishliAccuracyColor, NEUTRAL_MISHLI_FILL } from "@/lib/game/mishliAccuracyColor";
import { toArabicNumeral } from "@/lib/game/arabicNumerals";
import { MISHLI_BODY_PATH, MISHLI_INK } from "@/components/game/illustrations/mishliPaths";
import type { AttemptIndex } from "@/lib/game/types";

interface AttemptMishliIndicatorProps {
  attemptScores: number[];
  activeAttempt: AttemptIndex;
  phase: string;
}

const ORDINAL = ["الأول", "الثاني", "الثالث"] as const;

function labelFor(index: number, score: number | undefined): string {
  const ordinal = ORDINAL[index];
  if (score === undefined) {
    return `المشلي ${ordinal}: لم يُقطع بعد`;
  }
  if (score <= 0) {
    return `المشلي ${ordinal}: لم تُصب الضربة`;
  }
  return `المشلي ${ordinal}: ${toArabicNumeral(score)} نقطة`;
}

function MiniMishli({
  score,
  isActive,
}: {
  score: number | undefined;
  isActive: boolean;
}) {
  const resolved = score !== undefined;
  const missed = resolved && score <= 0;
  const fill = !resolved || missed
    ? NEUTRAL_MISHLI_FILL
    : getMishliAccuracyColor(score);

  const lift =
    isActive && !resolved
      ? "translate-y-[-2px] scale-[1.06] motion-reduce:translate-y-0 motion-reduce:scale-100"
      : "translate-y-0 scale-100";

  return (
    <span
      className={`relative inline-flex h-[30px] w-[24px] items-center justify-center transition-transform duration-200 sm:h-[35px] sm:w-[28px] ${lift}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 112 136"
        className="h-full w-full"
        overflow="visible"
      >
        <ellipse
          cx="56"
          cy="18"
          rx="5"
          ry="3.5"
          fill={fill}
          stroke={MISHLI_INK}
          strokeWidth="5"
        />
        <path
          d={MISHLI_BODY_PATH}
          fill={fill}
          stroke={MISHLI_INK}
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {!resolved && !missed && (
          <ellipse
            cx="42"
            cy="56"
            rx="10"
            ry="8"
            fill="#FFF8E7"
            opacity="0.35"
          />
        )}
        {missed && (
          <g stroke="#EF3340" strokeWidth="7" strokeLinecap="round">
            <path d="M34 44 L78 96" />
            <path d="M78 44 L34 96" />
          </g>
        )}
      </svg>
    </span>
  );
}

/**
 * Three miniature Mishlis — RTL: attempt 1 is physical rightmost.
 */
export function AttemptMishliIndicator({
  attemptScores,
  activeAttempt,
  phase,
}: AttemptMishliIndicatorProps) {
  // DOM order LTR visual: [attempt3, attempt2, attempt1] so RTL row
  // places attempt1 on the physical right.
  const order: AttemptIndex[] = [2, 1, 0];

  return (
    <div
      data-qa="attempt-mishli-indicator"
      className="flex items-center justify-center gap-1.5"
      role="list"
      aria-label="نتائج القصات"
    >
      {order.map((index) => {
        const score = attemptScores[index];
        const isActive =
          activeAttempt === index &&
          (phase === "ready" ||
            phase === "resolving-attempt" ||
            phase === "showing-result");
        return (
          <span
            key={`mini-mishli-${index}`}
            role="listitem"
            data-qa={`mini-mishli-${index}`}
            data-state={
              score === undefined ? "pending" : score <= 0 ? "miss" : "hit"
            }
            aria-label={labelFor(index, score)}
            className="pointer-events-none"
          >
            <MiniMishli
              score={score}
              isActive={isActive && phase === "ready"}
            />
          </span>
        );
      })}
    </div>
  );
}
