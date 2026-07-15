"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  toArabicNumeral,
} from "@/lib/game/arabicNumerals";
import { SplitMishliIllustration } from "@/components/game/illustrations/MishliHalfIllustration";

interface LevelCompleteModalProps {
  open: boolean;
  level: number;
  bonus: number;
  onNext: () => void;
}

export function LevelCompleteModal({
  open,
  level,
  bonus,
  onNext,
}: LevelCompleteModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="absolute inset-0 bg-stall-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative z-10 w-full max-w-sm rounded-[1.5rem] border-[5px] border-stall-ink bg-stall-cream px-6 py-7 text-center shadow-[8px_10px_0_#2D1C15]"
            initial={{ opacity: 0, scale: 0.82, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
          >
            <div className="mb-4">
              <SplitMishliIllustration />
            </div>

            <h2 className="font-display text-3xl font-extrabold text-stall-red">
              المشلي انقطع!
            </h2>
            <p className="mt-2 text-base font-bold text-stall-ink">
              كملت المستوى {toArabicNumeral(level)}
            </p>

            {bonus > 0 && (
              <p
                dir="ltr"
                className="mt-3 font-display text-xl font-extrabold text-stall-ink"
              >
                +{toArabicNumeral(bonus)} نقطة
              </p>
            )}

            <Button
              variant="game"
              onClick={onNext}
              className="mt-6 w-full font-display text-lg"
            >
              المستوى التالي
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
