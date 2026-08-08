"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { profile } from "@/lib/data";
import { commonWords } from "@/lib/words";

type IntroScreenProps = {
  onComplete?: () => void;
};

// Repeated to give enough volume to fill the screen at a tiny font size,
// like dense newsprint body text.
const backgroundText = Array(6).fill(commonWords.join(" ")).join(" ");

const STAMP_DURATION_MS = 650;
const EXIT_DURATION_MS = 500;

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [visible, setVisible] = useState(true);
  const [revealing, setRevealing] = useState(false);
  const revealingRef = useRef(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { stiffness: 400, damping: 32 });
  const springY = useSpring(cursorY, { stiffness: 400, damping: 32 });

  function handleMouseMove(e: React.MouseEvent) {
    cursorX.set(e.clientX - 25);
    cursorY.set(e.clientY - 130);
  }

  function trigger() {
    if (revealingRef.current) return;
    revealingRef.current = true;
    setRevealing(true);
    window.setTimeout(() => setVisible(false), STAMP_DURATION_MS);
  }

  function skip() {
    setVisible(false);
  }

  useEffect(() => {
    if (visible) return;
    const t = setTimeout(() => onComplete?.(), EXIT_DURATION_MS);
    return () => clearTimeout(t);
  }, [visible, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          role="status"
          aria-label="Loading site"
          onMouseMove={handleMouseMove}
          className="paper-grain fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-bg px-6 sm:cursor-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: EXIT_DURATION_MS / 1000, ease: "easeInOut" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 select-none overflow-hidden p-3 sm:p-6"
          >
            <div className="h-full w-full columns-3 gap-3 text-justify text-[8px] leading-[1.5] text-muted/25 sm:columns-6 sm:text-[9px] lg:columns-9">
              {backgroundText}
            </div>
          </div>

          <button
            type="button"
            onClick={skip}
            className="absolute right-6 top-6 border border-line-strong px-3 py-1.5 font-mono text-[10px] tracking-widest text-muted transition-colors hover:border-accent hover:text-ink sm:cursor-none"
          >
            SKIP INTRO
          </button>

          <button
            type="button"
            onMouseEnter={trigger}
            onFocus={trigger}
            onClick={trigger}
            className="group relative font-display text-4xl font-semibold tracking-tight text-ink outline-none sm:cursor-none sm:text-6xl md:text-7xl"
          >
            {profile.name}
            <AnimatePresence>
              {revealing && (
                <motion.svg
                  key="stamp"
                  viewBox="0 0 100 50"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute -inset-x-8 -inset-y-10 sm:-inset-x-12 sm:-inset-y-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  <motion.path
                    d="M6,25 C6,8 40,2 50,2 C62,2 94,10 94,25 C94,42 60,48 50,48 C38,48 6,40 6,25 Z"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </motion.svg>
              )}
            </AnimatePresence>
          </button>

          <p className="mt-6 font-mono text-xs tracking-widest text-muted">
            hover the quill over the name
          </p>

          <motion.div
            aria-hidden
            style={{ x: springX, y: springY }}
            className="pointer-events-none fixed left-0 top-0 z-50 hidden sm:block"
          >
            <svg width="112" height="136" viewBox="0 0 36 44" fill="none">
              <path
                d="M8 42 C8 42 6 36 9 34 L11 37 C9 35 7 31 11 29 L13 32 C10 29 9 22 14 17 C19 10 25 4 30 2 C33 5 34 12 30 18 C26 25 19 30 14 36 C12 38 10 40 8 42 Z"
                fill="var(--ink)"
                stroke="var(--accent)"
                strokeWidth="0.6"
              />
              <path
                d="M27 6 C20 16 13 28 9 40"
                stroke="var(--bg)"
                strokeWidth="0.9"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
