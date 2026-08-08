"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const STAMP_DURATION_MS = 650;
const EXIT_DURATION_MS = 500;

// How many words the background texture needs scales with viewport AREA
// (more columns AND more height on a big monitor), not with a fixed count.
// A fixed 6x repeat of the ~1,000-word list was enough for a laptop screen
// but ran dry partway down a large monitor, leaving a blank gap in the
// later columns. This constant (words needed per px^2, with ~25% headroom
// for cross-browser font-metric variance) is derived from that math and
// recomputed on mount/resize so it always overflows the viewport instead.
const WORDS_PER_PX2 = 0.0026;
const MIN_REPEAT = 6;
const MAX_REPEAT = 50;

function computeRepeat() {
  if (typeof window === "undefined") return 10; // generous default for first server paint
  const area = window.innerWidth * window.innerHeight;
  const wordsNeeded = area * WORDS_PER_PX2;
  const repeat = Math.ceil(wordsNeeded / commonWords.length);
  return Math.min(Math.max(repeat, MIN_REPEAT), MAX_REPEAT);
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [visible, setVisible] = useState(true);
  const [revealing, setRevealing] = useState(false);
  const [repeat, setRepeat] = useState(computeRepeat);
  const revealingRef = useRef(false);

  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);
  const springX = useSpring(cursorX, { stiffness: 400, damping: 32 });
  const springY = useSpring(cursorY, { stiffness: 400, damping: 32 });

  // Recompute if the window is resized (e.g. dragged to a bigger display)
  // while the intro is still up, so the texture never runs dry.
  useEffect(() => {
    function update() {
      setRepeat(computeRepeat());
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Pure decorative filler now — the name is no longer spliced into this
  // text by word index (see rationale below), so this is just one
  // continuous block sized to whatever the current viewport needs.
  const backgroundText = useMemo(
    () => Array(repeat).fill(commonWords).flat().join(" "),
    [repeat]
  );

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
          className="paper-grain fixed inset-0 z-50 overflow-hidden bg-bg sm:cursor-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: EXIT_DURATION_MS / 1000, ease: "easeInOut" }}
        >
          {/* Decorative texture only. Sized (via `repeat`) to always
              overflow the viewport so the columns never run dry and leave
              a blank gap on large monitors. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden p-3 sm:p-6"
          >
            <div className="h-full w-full columns-3 gap-3 text-justify text-[8px] leading-[1.5] text-muted/25 sm:columns-6 sm:text-[9px] lg:columns-9">
              {backgroundText}
            </div>
          </div>

          {/* Interactive name target, anchored to a fixed spot in the
              viewport rather than to a position inside the word flow
              above — its location no longer depends on word count or
              column math, so it lands in the same reliable place on
              every screen size instead of drifting off-screen. */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
            <button
              type="button"
              onMouseEnter={trigger}
              onFocus={trigger}
              onClick={trigger}
              className="group pointer-events-auto relative rounded bg-bg px-3 py-1.5 outline-none sm:cursor-none"
            >
              <span className="block text-center font-mono text-[11px] font-medium tracking-widest text-ink/70 sm:text-xs">
                Here
              </span>
              <span className="block text-center font-display text-sm font-bold text-ink sm:text-base">
                {profile.name}
              </span>
              <AnimatePresence>
                {revealing && (
                  <motion.svg
                    key="stamp"
                    viewBox="0 0 100 50"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute -inset-x-3 -inset-y-2 sm:-inset-x-4 sm:-inset-y-2"
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
          </div>

          <button
            type="button"
            onClick={skip}
            className="absolute right-6 top-6 border border-line-strong bg-bg px-3 py-1.5 font-mono text-[10px] tracking-widest text-muted transition-colors hover:border-accent hover:text-ink sm:cursor-none"
          >
            SKIP INTRO
          </button>

          <motion.p
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-bg px-3 font-mono text-xs tracking-widest text-muted"
          >
            trace the wanted name to enter
          </motion.p>

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
