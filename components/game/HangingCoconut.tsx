"use client";

import { forwardRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CoconutIllustration } from "./CoconutIllustration";
import { DROP_DURATION_MS } from "@/lib/game/constants";

interface HangingCoconutProps {
  swingAmplitude: number;
  swingSpeed: number;
  scale: number;
  cutProgress: number;
  isDropping: boolean;
  onDropComplete?: () => void;
  shakeKey?: number;
  top?: number;
}

export const HangingCoconut = forwardRef<HTMLDivElement, HangingCoconutProps>(
  function HangingCoconut(
    {
      swingAmplitude,
      swingSpeed,
      scale,
      cutProgress,
      isDropping,
      onDropComplete,
      shakeKey = 0,
      top = 0,
    },
    ref,
  ) {
    const [stemSnapped, setStemSnapped] = useState(false);
    const [localShake, setLocalShake] = useState(0);

    useEffect(() => {
      if (isDropping) setStemSnapped(true);
      else setStemSnapped(false);
    }, [isDropping]);

    useEffect(() => {
      if (shakeKey > 0) setLocalShake(shakeKey);
    }, [shakeKey]);

    const dropSeconds = DROP_DURATION_MS / 1000;

    return (
      <div
        data-qa="hanging-root"
        className="absolute left-1/2 z-10 -translate-x-1/2"
        style={{ top }}
      >
        <div className="relative flex flex-col items-center" style={{ scale }}>
          <div
            className={`h-14 w-1 rounded-full bg-gradient-to-b from-[#3d6b3a] via-[#5a8f55] to-[#8B5A2B] ${
              stemSnapped ? "animate-stem-snap" : ""
            }`}
            style={{ boxShadow: "0 0 6px rgba(74,124,89,0.4)" }}
          />

          <motion.div
            className="relative -mt-1 flex flex-col items-center"
            style={{ transformOrigin: "top center" }}
            animate={
              isDropping
                ? {
                    y: [0, 18, 430, 405],
                    rotate: [0, -10, 50, 75],
                    opacity: [1, 1, 1, 0],
                  }
                : { rotate: [-swingAmplitude, swingAmplitude] }
            }
            transition={
              isDropping
                ? {
                    duration: dropSeconds,
                    times: [0, 0.1, 0.82, 1],
                    ease: ["easeOut", "easeIn", "easeOut"],
                  }
                : {
                    duration: swingSpeed,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }
            }
            onAnimationComplete={() => {
              if (isDropping) onDropComplete?.();
            }}
          >
            <motion.div
              key={localShake || "idle"}
              animate={
                localShake > 0
                  ? { x: [0, -5, 5, -3, 2, 0], y: [0, 2, -1, 1, 0] }
                  : { x: 0, y: 0 }
              }
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <div className="relative">
                <CoconutIllustration
                  cutProgress={cutProgress}
                  idPrefix="hang"
                  className="h-40 w-36 drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]"
                  detached={isDropping}
                />
                {/* Fruit-body hit target — excludes stem and crown */}
                <div
                  ref={ref}
                  data-qa="coconut-hitbox"
                  className="pointer-events-none absolute inset-x-[13%] top-[17%] bottom-[7%]"
                  aria-hidden
                />
              </div>
            </motion.div>

            <AnimatePresence>
              {isDropping && (
                <motion.div
                  className="pointer-events-none absolute inset-0"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.65, delay: 0.05 }}
                >
                  {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i / 8) * Math.PI * 2;
                    return (
                      <motion.span
                        key={i}
                        className="absolute left-1/2 top-1/2 block h-2 w-2"
                        style={{
                          background: i % 2 === 0 ? "#6B8F3C" : "#527A59",
                          marginLeft: -4,
                          marginTop: -4,
                          borderRadius: i % 2 === 0 ? 2 : 999,
                        }}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{
                          x: Math.cos(angle) * (42 + (i % 3) * 16),
                          y: Math.sin(angle) * (28 + (i % 3) * 12) - 12,
                          opacity: 0,
                          scale: 0.35,
                          rotate: 80 + i * 18,
                        }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                      />
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    );
  },
);
