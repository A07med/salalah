import { DrizzleLayer } from "./DrizzleLayer";
import { MistLayers } from "./MistLayers";

/** Dhofar roadside fruit stall — open view to misty Khareef hills */
export function DhofarFruitStallBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Outdoor opening ~38% */}
      <div
        className="absolute inset-x-0 top-0 h-[38%]"
        style={{
          background:
            "linear-gradient(180deg, var(--stall-sky) 0%, var(--stall-mist) 72%, #C8D9CE 100%)",
        }}
      />

      {/* Soft Khareef hills */}
      <svg
        className="absolute inset-x-0 top-[14%] h-[18%] w-full opacity-70"
        viewBox="0 0 400 80"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0 62 L70 38 L140 52 L210 28 L280 46 L350 34 L400 48 L400 80 L0 80 Z"
          fill="#6B8F6E"
          opacity="0.45"
        />
        <path
          d="M0 70 L90 48 L180 62 L260 42 L340 56 L400 44 L400 80 L0 80 Z"
          fill="#527A59"
          opacity="0.35"
        />
      </svg>

      <div className="absolute inset-x-0 top-[22%] flex justify-center opacity-65">
        <MistLayers className="h-12 w-full max-w-sm" />
      </div>

      {/* Upper canopy beam */}
      <div
        className="absolute inset-x-3 top-[34%] h-3 rounded-sm border-[3px] border-stall-ink sm:inset-x-5"
        style={{
          background: "linear-gradient(180deg, var(--stall-wood-light), var(--stall-wood-mid))",
          boxShadow: "0 5px 0 var(--stall-ink)",
        }}
      />

      {/* Stall posts */}
      <div className="absolute inset-x-0 top-0 flex h-full justify-between px-2 sm:px-4">
        <div
          className="mt-[34%] h-[58%] w-5 rounded-sm border-[4px] border-stall-ink"
          style={{
            background:
              "linear-gradient(90deg, var(--stall-wood-dark) 0%, var(--stall-wood-mid) 45%, var(--stall-wood-light) 100%)",
            boxShadow: "5px 0 0 var(--stall-ink)",
          }}
        />
        <div
          className="mt-[34%] h-[58%] w-5 rounded-sm border-[4px] border-stall-ink"
          style={{
            background:
              "linear-gradient(90deg, var(--stall-wood-light) 0%, var(--stall-wood-mid) 55%, var(--stall-wood-dark) 100%)",
            boxShadow: "-5px 0 0 var(--stall-ink)",
          }}
        />
      </div>

      {/* Canopy shadow on counter */}
      <div
        className="absolute inset-x-6 top-[37%] h-6 opacity-25"
        style={{
          background: "linear-gradient(180deg, rgba(45,28,21,0.35), transparent)",
        }}
      />

      {/* Single palm accent */}
      <svg
        className="absolute -left-1 top-[5%] h-[4.5rem] w-20 rotate-[-16deg] opacity-90"
        viewBox="0 0 80 80"
        aria-hidden
      >
        <path
          d="M40 8 C22 18 12 38 16 58 C20 72 32 76 40 78 C48 76 60 72 64 58 C68 38 58 18 40 8 Z"
          fill="#527A59"
          stroke="#2D1C15"
          strokeWidth="3"
        />
        <path
          d="M40 18 L40 68 M26 32 L54 48"
          stroke="#2D1C15"
          strokeWidth="2"
          fill="none"
          opacity="0.4"
        />
      </svg>

      {/* Small banana bunch */}
      <svg
        className="absolute right-[10%] top-[12%] h-12 w-9"
        viewBox="0 0 40 56"
        aria-hidden
      >
        <path d="M20 4 L20 16" stroke="#754326" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="14" cy="24" rx="5" ry="9" fill="#F6C945" stroke="#2D1C15" strokeWidth="2" transform="rotate(-12 14 24)" />
        <ellipse cx="22" cy="28" rx="5" ry="10" fill="#F6C945" stroke="#2D1C15" strokeWidth="2" transform="rotate(6 22 28)" />
        <ellipse cx="18" cy="36" rx="4" ry="8" fill="#E8B830" stroke="#2D1C15" strokeWidth="2" transform="rotate(-4 18 36)" />
      </svg>

      {/* Outdoor drizzle — upper opening only */}
      <div className="absolute inset-x-0 top-0 h-[34%] overflow-hidden">
        <DrizzleLayer />
      </div>
    </div>
  );
}
