"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { profile } from "@/lib/data";

type IntroScreenProps = {
  onComplete?: () => void;
};

const proofMarks = [
  { text: "PROOF SHEET", className: "left-[8%] top-[16%] -rotate-6" },
  { text: "DRAFT 01", className: "right-[10%] top-[22%] rotate-3" },
  { text: "TYPESET", className: "left-[10%] bottom-[24%] rotate-2" },
  { text: "REVISION 3", className: "right-[8%] bottom-[18%] -rotate-3" },
  { text: "PRESS READY", className: "left-[4%] top-[48%] -rotate-2" },
];

const AUTO_REVEAL_MS = 12000;
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
    cursorX.set(e.clientX - 56);
    cursorY.set(e.clientY - 68);
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

  // Accessibility / fallback: reveal automatically if no one interacts.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!revealingRef.current) skip();
    }, AUTO_REVEAL_MS);
    return () => clearTimeout(t);
  }, []);

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
          {proofMarks.map((mark) => (
            <span
              key={mark.text}
              className={`pointer-events-none absolute select-none font-mono text-[10px] tracking-[0.3em] text-muted/50 ${mark.className}`}
            >
              {mark.text}
            </span>
          ))}

          <button
            type="button"
            onClick={skip}
            className="absolute right-6 top-6 border border-line-strong px-3 py-1.5 font-mono text-[10px] tracking-widest text-muted transition-colors hover:border-accent hover:text-ink"
          >
            SKIP INTRO
          </button>

          <button
            type="button"
            onMouseEnter={trigger}
            onFocus={trigger}
            onClick={trigger}
            className="group relative font-display text-4xl font-semibold tracking-tight text-ink outline-none sm:text-6xl md:text-7xl"
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
