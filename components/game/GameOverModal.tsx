"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CoconutIllustration } from "./CoconutIllustration";
import { Button } from "@/components/ui/Button";

interface GameOverModalProps {
  open: boolean;
  score: number;
  bestScore: number;
  level: number;
  onPlayAgain: () => void;
}

export function GameOverModal({
  open,
  score,
  bestScore,
  level,
  onPlayAgain,
}: GameOverModalProps) {
  const isNewBest = score >= bestScore && score > 0;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-[1.75rem] border-2 border-warning-red/35 px-6 py-7 text-center shadow-2xl"
            style={{
              background:
                "linear-gradient(165deg, #3d4a38 0%, #1a2e22 50%, #0f1a14 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,247,230,0.1), 0 20px 40px rgba(0,0,0,0.5)",
            }}
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 340, damping: 24 }}
          >
            <div className="mx-auto mb-2 w-24 opacity-90">
              <CoconutIllustration
                cutProgress={20}
                idPrefix="over"
                className="h-28 w-24 grayscale-[30%]"
              />
            </div>

            <h2 className="font-display text-3xl font-extrabold text-khareef-cream">
              انتهت اللعبة
            </h2>

            <div className="mt-4">
              <p className="text-sm text-khareef-mist">نتيجتك</p>
              <p className="font-display text-5xl font-extrabold tabular-nums text-gold drop-shadow-md">
                {score}
              </p>
            </div>

            <div className="mt-4 flex justify-center gap-3">
              <div className="game-badge rounded-2xl px-4 py-2">
                <p className="text-[10px] text-khareef-cream/75">أفضل نتيجة</p>
                <p className="font-display text-lg font-bold tabular-nums text-khareef-cream">
                  {bestScore}
                </p>
              </div>
              <div className="game-badge rounded-2xl px-4 py-2">
                <p className="text-[10px] text-khareef-cream/75">المستوى</p>
                <p className="font-display text-lg font-bold text-khareef-cream">
                  {level}
                </p>
              </div>
            </div>

            {isNewBest && (
              <p className="mt-3 font-display text-base font-bold text-gold">
                رقم قياسي جديد!
              </p>
            )}

            <Button
              onClick={onPlayAgain}
              className="mt-6 w-full font-display text-lg"
            >
              العب مرة ثانية
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
