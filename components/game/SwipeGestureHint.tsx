"use client";

import { CLEAVER_BODY_PATH } from "./GameplayCleaver";

interface SwipeGestureHintProps {
  mode?: "tutorial" | "tap-feedback";
  shakeKey?: number;
}

export function SwipeGestureHint({
  mode = "tutorial",
  shakeKey = 0,
}: SwipeGestureHintProps) {
  const isTapFeedback = mode === "tap-feedback";

  return (
    <div
      key={`${mode}-${shakeKey}`}
      data-qa={isTapFeedback ? "tap-drag-feedback" : "swipe-gesture-hint"}
      className={`pointer-events-none rounded-xl border-[3px] border-stall-ink bg-stall-cream px-3 py-2 text-center text-stall-ink shadow-[4px_4px_0_#2D1C15] ${
        isTapFeedback ? "animate-screen-shake" : ""
      }`}
      role="status"
      aria-live={isTapFeedback ? "polite" : "off"}
    >
      <p className="font-display text-[13px] font-extrabold leading-5">
        {isTapFeedback
          ? "اسحب الساطور، لا تنقر فقط"
          : "اسحب الساطور على علامة القطع — اضغط واسحب عبر الخط."}
      </p>

      <svg
        data-qa="swipe-hint-motion"
        className="mx-auto mt-0.5 h-5 w-28 overflow-visible"
        viewBox="0 0 112 20"
        aria-hidden
      >
        <path
          d="M8 13 H104"
          fill="none"
          stroke="#C45C26"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="5 5"
          opacity="0.8"
        />
        <g className="animate-swipe-gesture motion-reduce:animate-none">
          <g transform="translate(39 -3) scale(.045) rotate(-42 256 256)">
            <path
              d={CLEAVER_BODY_PATH}
              fill="#E8E8E8"
              stroke="#2D1C15"
              strokeWidth="22"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
