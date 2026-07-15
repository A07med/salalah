import { ReactNode } from "react";
import { EdgeDecorations } from "./EdgeDecorations";
import { DhofarJournalBackdrop } from "./illustrations/DhofarJournalBackdrop";

interface GamePaperBackgroundProps {
  children: ReactNode;
  className?: string;
}

export function GamePaperBackground({
  children,
  className = "",
}: GamePaperBackgroundProps) {
  return (
    <div className={`relative min-h-svh w-full min-w-0 ${className}`}>
      <div
        className="game-paper-bg pointer-events-none absolute inset-0 overflow-x-clip overflow-y-hidden"
        aria-hidden
      >
        <DhofarJournalBackdrop />
        <EdgeDecorations />
      </div>
      <div className="relative z-10 min-w-0">{children}</div>
    </div>
  );
}
