"use client";

/**
 * Gameplay meat cleaver — cleaned Lorc (Game Icons) silhouette, CC BY 3.0.
 * Source matches attached meat-cleaver asset and docs/open-source-asset-references/lorc-meat-cleaver.svg
 * Attribution: public/assets/open-source/ATTRIBUTIONS.md
 */

/** Blade-impact anchor: centre of the long cutting edge (512 viewBox). */
export const CLEAVER_VIEWBOX = 512;
/** Max mobile dimension — blade edge anchors to impact; handle stays outside fruit. */
export const CLEAVER_RENDER_SIZE = 72;
export const CLEAVER_BLADE_ANCHOR = { x: 418, y: 210 };
/** Native angle of the cutting-edge outward normal in SVG space (degrees). */
export const CLEAVER_NATIVE_ANGLE = 48;

export const CLEAVER_BODY_PATH =
  "M312.813 24.313 88.5 282.938l65.563 95.718c90.372-68.07 182.097-177.937 254.843-295.844l-96.094-58.5zm9.125 30.03c2.658.03 4.815.813 6.562 2 3.494 2.376 6.438 7.41 6.438 16.376 0 17.928-14.45 41.012-29.657 48.124-7.603 3.555-12.692 2.844-16.186.47-3.494-2.377-6.47-7.412-6.47-16.376 0-17.93 14.48-41.014 29.688-48.126 3.803-1.777 6.967-2.5 9.625-2.468zm102.937 38.188c-73.88 119.784-166.747 231.365-260.25 301.564l42.53 62.125c93.965-68.158 219.3-202.6 281.564-324.845L424.874 92.53zM73.5 294.126c-17.832 17.12-35.684 32.712-53.563 46.844v120.59c27.78-33.634 57.404-75.49 87.75-117.53L73.5 294.124z";

interface GameplayCleaverProps {
  x: number;
  y: number;
  angle: number;
  visible: boolean;
  fading?: boolean;
  reducedMotion?: boolean;
  showAnchorDebug?: boolean;
}

export function GameplayCleaver({
  x,
  y,
  angle,
  visible,
  fading = false,
  reducedMotion = false,
  showAnchorDebug = false,
}: GameplayCleaverProps) {
  if (!visible) return null;

  const rotation = angle - CLEAVER_NATIVE_ANGLE;
  const anchor = CLEAVER_BLADE_ANCHOR;
  const scale = CLEAVER_RENDER_SIZE / CLEAVER_VIEWBOX;
  const originX = anchor.x * scale;
  const originY = anchor.y * scale;

  return (
    <div
      data-qa="gameplay-cleaver"
      data-anchor-x={x}
      data-anchor-y={y}
      className={`pointer-events-none absolute z-[28] ${fading ? "animate-cleaver-fade" : ""}`}
      style={{
        left: x,
        top: y,
        width: CLEAVER_RENDER_SIZE,
        height: CLEAVER_RENDER_SIZE,
        transform: `translate(-${originX}px, -${originY}px) rotate(${rotation}deg)`,
        transformOrigin: `${originX}px ${originY}px`,
        opacity: fading ? undefined : 1,
        transition: reducedMotion ? "none" : undefined,
        filter: "drop-shadow(4px 5px 0 #2D1C15)",
      }}
    >
      <svg
        viewBox="0 0 512 512"
        className="h-full w-full overflow-visible"
        aria-hidden
      >
        {/* Hard offset under-silhouette (restrained) */}
        <path
          d={CLEAVER_BODY_PATH}
          fill="#2D1C15"
          fillRule="evenodd"
          opacity="0.18"
          transform="translate(10 12)"
        />

        {/* Silver blade + hole cutout */}
        <path
          d={CLEAVER_BODY_PATH}
          fill="var(--cleaver-blade, #E8E8E8)"
          fillRule="evenodd"
          stroke="var(--cleaver-ink, #2D1C15)"
          strokeWidth="14"
          strokeLinejoin="round"
        />

        {/* Soft highlight patch on blade face */}
        <ellipse
          cx="300"
          cy="160"
          rx="48"
          ry="28"
          fill="var(--cleaver-highlight, #FFF8E7)"
          opacity="0.35"
          transform="rotate(-38 300 160)"
        />

        {/* Wooden handle — bottom-left stub region */}
        <path
          d="M20 340 L73.5 294 L107 344 L87.75 417.5 C57.4 375.5 27.8 333.6 0 300 L20 340 Z"
          fill="var(--cleaver-handle, #7A4B30)"
          stroke="var(--cleaver-ink, #2D1C15)"
          strokeWidth="12"
          strokeLinejoin="round"
        />
        <path
          d="M34 352 L70 318 L88 348 L62 390 Z"
          fill="var(--cleaver-handle-highlight, #A96F43)"
          opacity="0.55"
        />

        {/* Restrained red cutting-edge accent (long outer edge) */}
        <path
          d="M430 90 L455 150 L400 280 L330 360"
          fill="none"
          stroke="var(--cleaver-edge, #EF3340)"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Blade-impact anchor (centre of cutting edge) */}
        <circle
          data-qa="cleaver-blade-anchor"
          cx={anchor.x}
          cy={anchor.y}
          r={showAnchorDebug ? 10 : 1}
          fill={showAnchorDebug ? "#EF3340" : "transparent"}
          opacity={showAnchorDebug ? 0.95 : 0}
        />
      </svg>
    </div>
  );
}
