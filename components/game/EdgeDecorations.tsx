import { CoconutHalfSticker } from "./illustrations/CoconutHalfSticker";
import { FrankincenseSticker } from "./illustrations/FrankincenseSticker";
import { PalmLeafSticker } from "./illustrations/PalmLeafSticker";

/** Edge decorations for StartScreen paper — behind content, pointer-events none */
export function EdgeDecorations() {
  return (
    <>
      {/* Cleaned Lorc meat cleaver — upper-left, partially clipped */}
      <div
        className="pointer-events-none absolute -left-3 top-[5.75rem] z-0 rotate-[16deg] sm:left-0 sm:top-24"
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/open-source/meat-cleaver.svg"
          alt=""
          width={72}
          height={72}
          className="h-[4.25rem] w-[4.25rem] drop-shadow-[4px_5px_0_#2D1C15] sm:h-[4.75rem] sm:w-[4.75rem]"
          draggable={false}
        />
      </div>

      {/* Palm leaf — upper-right, reduced size */}
      <div
        className="pointer-events-none absolute -right-1 top-16 z-0 rotate-[-8deg] opacity-85 sm:right-1"
        aria-hidden="true"
      >
        <PalmLeafSticker className="h-14 w-14 sm:h-16 sm:w-16" />
      </div>

      {/* Coconut half — lower-left, partially clipped */}
      <div
        className="pointer-events-none absolute -left-10 bottom-14 z-0 rotate-[-5deg]"
        aria-hidden="true"
      >
        <CoconutHalfSticker className="h-[5.5rem] w-[5.5rem] sm:h-24 sm:w-24" />
      </div>

      {/* Frankincense — lower-right */}
      <div
        className="pointer-events-none absolute -right-2 bottom-16 z-0 rotate-[10deg] opacity-90 sm:right-0"
        aria-hidden="true"
      >
        <FrankincenseSticker className="h-14 w-12 sm:h-16 sm:w-14" />
      </div>
    </>
  );
}
