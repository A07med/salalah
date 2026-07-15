"use client";

import { useCallback, useState } from "react";
import { GameShell } from "@/components/layout/GameShell";
import { StartScreen } from "@/components/game/StartScreen";
import { GameStage } from "@/components/game/GameStage";
import { createGameSessionId } from "@/lib/game/sessionId";
import {
  getLocalBestScore,
  saveLocalBestScore,
} from "@/lib/game/storage";

interface ActiveGame {
  playerName: string;
  sessionId: string;
}

export default function Home() {
  const [bestScore, setBestScore] = useState(() =>
    typeof window !== "undefined" ? getLocalBestScore() : 0,
  );
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  const [leaderboardRevision, setLeaderboardRevision] = useState(0);

  const handleStart = useCallback((playerName: string) => {
    setActiveGame({
      playerName,
      sessionId: createGameSessionId(),
    });
  }, []);

  const handleExit = useCallback((sessionScore: number) => {
    if (sessionScore > 0) {
      saveLocalBestScore(sessionScore);
    }
    setBestScore(getLocalBestScore());
    setActiveGame(null);
  }, []);

  return (
    <GameShell>
      {!activeGame ? (
        <StartScreen
          key={`start-${bestScore}-${leaderboardRevision}`}
          bestScore={bestScore}
          leaderboardRevision={leaderboardRevision}
          onStart={handleStart}
        />
      ) : (
        <GameStage
          key={activeGame.sessionId}
          playerName={activeGame.playerName}
          sessionId={activeGame.sessionId}
          onExit={handleExit}
          onLeaderboardUpdated={() => {
            setLeaderboardRevision((revision) => revision + 1);
          }}
        />
      )}
    </GameShell>
  );
}
