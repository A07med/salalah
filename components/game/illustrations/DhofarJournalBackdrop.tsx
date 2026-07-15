import { DhofarMountains } from "./DhofarMountains";
import { MistLayers } from "./MistLayers";
import { DrizzleLayer } from "./DrizzleLayer";

/** Khareef journal atmospheric backdrop — anchored to screen bottom */
export function DhofarJournalBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 min-h-svh overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-x-0 bottom-0 h-[42%] min-h-[9.5rem]">
        <DhofarMountains className="h-full w-full" />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[5.5rem]">
        <MistLayers className="h-full w-full" />
      </div>

      <DrizzleLayer className="opacity-75" />
    </div>
  );
}
