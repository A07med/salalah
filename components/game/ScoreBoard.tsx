"use client";

interface ScoreBoardProps {
  score: number;
}

export function ScoreBoard({ score }: ScoreBoardProps) {
  return (
    <div className="stall-hud-card min-w-[4.75rem] px-3 py-1.5 text-center">
      <p className="text-[10px] font-bold text-stall-ink/70">النقاط</p>
      <p className="font-display text-xl font-extrabold tabular-nums leading-tight text-stall-red">
        {score}
      </p>
    </div>
  );
}
