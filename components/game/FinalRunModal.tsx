"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CoconutIllustration } from "./CoconutIllustration";
import { Button } from "@/components/ui/Button";
import { toArabicNumeral } from "@/lib/game/arabicNumerals";
import { MAX_RUN_SCORE } from "@/lib/game/scoreVersion";

interface FinalRunModalProps {
  open: boolean;
  totalScore: number;
  bestScore: number;
  attemptScores: number[];
  onPlayAgain: () => void;
  onExit?: () => void;
}

export function FinalRunModal({
  open,
  totalScore,
  bestScore,
  attemptScores,
  onPlayAgain,
  onExit,
}: FinalRunModalProps) {
  const isNewBest = totalScore >= bestScore && totalScore > 0;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            data-qa="final-run-modal"
            className="game-surface relative z-10 w-full max-w-sm px-5 py-6 text-center"
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 340, damping: 24 }}
          >
            <div className="mx-auto mb-2 w-20">
              <CoconutIllustration
                cutProgress={100}
                idPrefix="final"
                variant="sticker"
                className="h-24 w-20"
              />
            </div>

            <h2 className="font-display text-3xl font-extrabold text-game-ink">
              خلص التحدي!
            </h2>

            <p className="mt-3 font-display text-2xl font-extrabold text-game-red">
              <bdi dir="ltr">{toArabicNumeral(totalScore)}</bdi>
              {" من "}
              <bdi dir="ltr">{toArabicNumeral(MAX_RUN_SCORE)}</bdi>
            </p>

            <ol className="mt-4 space-y-1.5 text-sm font-bold text-game-ink">
              {attemptScores.map((score, index) => (
                <li
                  key={`attempt-${index}`}
                  data-qa="final-attempt-row"
                  className="flex items-center justify-between rounded-xl border-[3px] border-game-ink bg-game-bg px-3 py-2"
                >
                  <span>المشلي {toArabicNumeral(index + 1)}</span>
                  <bdi dir="ltr" className="tabular-nums text-game-red">
                    {toArabicNumeral(score)}
                  </bdi>
                </li>
              ))}
            </ol>

            {isNewBest && (
              <p className="mt-3 font-display text-base font-bold text-game-red">
                رقم قياسي جديد!
              </p>
            )}

            <Button
              variant="game"
              onClick={onPlayAgain}
              className="mt-5 w-full font-display text-lg"
            >
              العب مرة ثانية
            </Button>

            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="mt-3 min-h-11 w-full rounded-xl border-[3px] border-game-ink bg-game-bg px-4 text-sm font-extrabold text-game-ink"
              >
                العودة للرئيسية
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
