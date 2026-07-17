import type { HTMLAttributes, ReactNode, Ref } from "react";

interface WoodenCuttingTableProps {
  progress?: ReactNode;
  children: ReactNode;
  boardShake?: boolean;
  cuttingZoneRef?: Ref<HTMLDivElement>;
  cuttingZoneProps?: HTMLAttributes<HTMLDivElement>;
}

/** Centred stall counter with chopping board — fruit sits in the usable table area */
export function WoodenCuttingTable({
  progress,
  children,
  boardShake = false,
  cuttingZoneRef,
  cuttingZoneProps,
}: WoodenCuttingTableProps) {
  return (
    <div
      data-qa="cutting-table"
      className="absolute inset-x-0 bottom-0 z-10 mx-auto flex h-[63%] items-center justify-center px-4 pb-[max(3.25rem,env(safe-area-inset-bottom))]"
    >
      {/* Illustrated plank counter */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-full w-full"
        viewBox="0 0 390 520"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden
      >
        {/* Plank bands */}
        <path d="M0 48 L390 36 L390 168 L0 188 Z" fill="var(--stall-wood-light)" />
        <path d="M0 188 L390 168 L390 308 L0 328 Z" fill="var(--stall-wood-mid)" />
        <path d="M0 328 L390 308 L390 448 L0 468 Z" fill="#B87340" />
        <path d="M0 468 L390 448 L390 520 L0 520 Z" fill="var(--stall-wood-dark)" />

        {/* Join lines */}
        <path d="M0 188 L390 168" stroke="var(--stall-wood-dark)" strokeWidth="2.5" opacity="0.5" />
        <path d="M0 328 L390 308" stroke="var(--stall-wood-dark)" strokeWidth="2.5" opacity="0.5" />
        <path d="M0 468 L390 448" stroke="#5A3218" strokeWidth="3" opacity="0.55" />

        {/* Front counter lip */}
        <path
          d="M0 456 L390 436 L390 472 L0 492 Z"
          fill="#8F4E28"
          stroke="var(--stall-ink)"
          strokeWidth="4"
        />

        {/* Grain */}
        <path
          d="M24 88 Q110 96 190 82 M40 240 Q150 252 280 232 M60 380 Q200 392 330 368"
          stroke="var(--stall-wood-dark)"
          strokeWidth="1.4"
          fill="none"
          opacity="0.28"
        />
        {/* Water marks */}
        <ellipse cx="72" cy="260" rx="14" ry="6" fill="#D4A06A" opacity="0.18" />
        <ellipse cx="310" cy="390" rx="16" ry="7" fill="#D4A06A" opacity="0.15" />
        <path
          d="M140 220 L146 226 M260 350 L266 354"
          stroke="#754326"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.3"
        />
      </svg>

      <div className="relative flex w-full max-w-[18.5rem] flex-col items-center gap-7">
        {progress ? (
          <div data-qa="cut-progress" className="pointer-events-none w-full shrink-0">
            {progress}
          </div>
        ) : null}

        <div
          data-qa="chopping-board"
          className={`relative w-full shrink-0 ${boardShake ? "animate-board-shake" : ""}`}
        >
          <div className="relative flex h-[15.75rem] w-full items-end justify-center pb-4">
            <svg
              viewBox="0 0 320 168"
              className="pointer-events-none absolute bottom-0 w-full"
              aria-hidden
            >
            {/* Board shadow */}
            <path
              d="M30 44 C46 30 274 30 290 44 C302 56 302 148 290 160 C274 174 46 174 30 160 C18 148 18 56 30 44 Z"
              fill="#2D1C15"
              transform="translate(5 7)"
            />
            {/* Board top */}
            <path
              d="M26 40 C42 28 278 28 294 40 C306 52 306 144 294 156 C278 168 42 168 26 156 C14 144 14 52 26 40 Z"
              fill="var(--stall-board)"
              stroke="var(--stall-ink)"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            {/* Side edge */}
            <path
              d="M286 44 C298 54 298 146 286 156 L294 156 C306 144 306 52 294 40 Z"
              fill="#D9A865"
              stroke="var(--stall-ink)"
              strokeWidth="4"
            />
            {/* Knife marks */}
            <path d="M88 92 L232 100" stroke="#754326" strokeWidth="2" opacity="0.32" strokeLinecap="round" />
            <path d="M108 118 L214 110" stroke="#754326" strokeWidth="1.8" opacity="0.28" strokeLinecap="round" />
            <path d="M138 68 L178 72" stroke="#754326" strokeWidth="1.6" opacity="0.25" strokeLinecap="round" />
            </svg>

            {/* Full-board capture surface so swipes may start beside/above the fruit */}
            <div
              ref={cuttingZoneRef}
              data-qa="cutting-zone"
              {...cuttingZoneProps}
              className={`absolute inset-0 z-10 flex touch-none items-end justify-center pb-4 ${cuttingZoneProps?.className ?? ""}`}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
