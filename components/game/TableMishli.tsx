"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CoconutIllustration } from "./CoconutIllustration";
import { MishliHalfIllustration } from "./illustrations/MishliHalfIllustration";
import { MishliCrackLayer } from "./illustrations/MishliCrackLayer";
import { DROP_DURATION_MS } from "@/lib/game/constants";
import type { MishliHitMark } from "@/lib/game/types";

interface TableMishliProps {
  cutProgress: number;
  isSplitting: boolean;
  keepHalves?: boolean;
  onSplitComplete?: () => void;
  hitShakeKey?: number;
  scale?: number;
  hitMarks?: MishliHitMark[];
}

export function TableMishli({
  cutProgress,
  isSplitting,
  keepHalves = false,
  onSplitComplete,
  hitShakeKey = 0,
  scale = 1,
  hitMarks = [],
}: TableMishliProps) {
  const [localShake, setLocalShake] = useState(0);
  const splitSeconds = DROP_DURATION_MS / 1000;
  const showHalves = isSplitting || keepHalves;

  useEffect(() => {
    if (hitShakeKey <= 0) return;
    const frame = requestAnimationFrame(() => setLocalShake(hitShakeKey));
    return () => cancelAnimationFrame(frame);
  }, [hitShakeKey]);

  useEffect(() => {
    if (!isSplitting) return;
    const timer = window.setTimeout(() => onSplitComplete?.(), DROP_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [isSplitting, onSplitComplete]);

  return (
    <div
      data-qa="table-mishli-root"
      className="relative flex items-center justify-center"
      style={{ scale }}
    >
      <AnimatePresence mode="wait">
        {showHalves ? (
          <motion.div
            key="split"
            className="relative flex items-end justify-center gap-0.5"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              initial={isSplitting ? { x: 0, rotate: 0 } : false}
              animate={{ x: -10, rotate: -12, y: 2 }}
              transition={{ duration: splitSeconds, ease: "easeOut" }}
            >
              <MishliHalfIllustration side="left" />
            </motion.div>
            <motion.div
              initial={isSplitting ? { x: 0, rotate: 0 } : false}
              animate={{ x: 10, rotate: 12, y: 3 }}
              transition={{ duration: splitSeconds, ease: "easeOut" }}
            >
              <MishliHalfIllustration side="right" />
            </motion.div>
            {isSplitting && (
              <motion.svg
                className="pointer-events-none absolute left-1/2 top-[42%] h-10 w-16 -translate-x-1/2"
                viewBox="0 0 96 48"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: [0, 1, 0], scale: [0.6, 1.15, 1.3] }}
                transition={{ duration: splitSeconds * 0.7, ease: "easeOut" }}
                aria-hidden
              >
                <ellipse cx="48" cy="28" rx="28" ry="10" fill="#DCE8DF" opacity="0.7" />
                <ellipse cx="36" cy="24" rx="6" ry="4" fill="#B9D3CF" opacity="0.75" />
                <ellipse cx="54" cy="20" rx="5" ry="3" fill="#B9D3CF" opacity="0.65" />
              </motion.svg>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="whole"
            data-qa="fruit-body"
            className={`relative -rotate-6 ${localShake ? "animate-mishli-hit" : ""}`}
            onAnimationEnd={() => setLocalShake(0)}
          >
            <CoconutIllustration
              cutProgress={cutProgress}
              idPrefix="table"
              variant="table"
              className="aspect-[112/136] h-[clamp(190px,52vw,220px)] w-auto"
            />
            <MishliCrackLayer marks={hitMarks} />
            <div
              data-qa="coconut-hitbox"
              className="pointer-events-none absolute inset-x-[12%] top-[12%] bottom-[6%]"
              aria-hidden
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
