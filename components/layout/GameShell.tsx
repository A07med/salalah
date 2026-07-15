"use client";

import { ReactNode } from "react";

interface GameShellProps {
  children: ReactNode;
}

export function GameShell({ children }: GameShellProps) {
  return (
    <div className="flex min-h-svh w-full justify-center bg-stall-sky touch-pan-y select-none">
      <div
        data-qa="game-shell"
        className="relative mx-auto min-h-svh w-full max-w-[480px] min-w-0"
      >
        {children}
      </div>
    </div>
  );
}
