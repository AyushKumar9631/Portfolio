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

// Words per faux "block" within the page grid. Kept short so several
// blocks tile per row, like a real front page.
const WORDS_PER_ARTICLE = 110;

// Real front pages are a grid of story modules, not flowing text: a
// headline always spans the same number of columns as its story, photos
// span columns the same way, and a dominant story runs bigger than the
// rest (see e.g. Andy Clarke's "Transcending CSS" ch.10 on broadsheet
// grids). This repeating 5-block rhythm mimics that — one dominant
// (2-col) story, a photo module, and regular 1-col stories between —
// tiled down the page instead of one flat column of text.
type BlockType = "feature" | "regular" | "image";

type Block = {
  type: BlockType;
  headline: string;
  body: string;
  caption?: string;
};

function computeRepeat() {
  if (typeof window === "undefined") return 10; // generous default for first server paint
  const area = window.innerWidth * window.innerHeight;
  const wordsNeeded = area * WORDS_PER_PX2;
  const repeat = Math.ceil(wordsNeeded / commonWords.length);
  return Math.min(Math.max(repeat, MIN_REPEAT), MAX_REPEAT);
}

// Chops the (viewport-scaled) word supply into block-sized chunks, each
// with its own short "headline" line pulled from partway through that
// chunk's own words — cheap way to get varied-looking headlines without a
// separate word source, since none of this text is meant to be read.
// Every 5th block becomes a dominant "feature" (2-column headline+body)
// and the block after it becomes an "image" module (placeholder graphic
// + one-line cutline instead of body copy) — a fixed rhythm rather than
// random, so the page reads as deliberately edited rather than noisy.
function buildBlocks(repeat: number): Block[] {
  const words = Array(repeat).fill(commonWords).flat();
  const blocks: Block[] = [];
  let i = 0;
  let index = 0;
  while (i < words.length) {
    const body = words.slice(i, i + WORDS_PER_ARTICLE);
    if (body.length === 0) break;
    i += WORDS_PER_ARTICLE;
    const mid = Math.floor(body.length / 2);
    const headline = body.slice(mid, mid + 3).join(" ");
    const cycle = index % 5;
    index += 1;
    if (cycle === 3) {
      blocks.push({
        type: "image",
        headline,
        body: body.join(" "),
        caption: body.slice(0, 4).join(" "),
      });
    } else {
      blocks.push({
        type: cycle === 0 ? "feature" : "regular",
        headline,
        body: body.join(" "),
      });
    }
  }
  return blocks;
}

// Classic "image not found" glyph (frame + sun + mountains) — reads
// instantly as "a photo goes here" without pulling in an actual image,
// which would need real rights-cleared content this decorative texture
// has no business using.
function ImagePlaceholderIcon() {
  return (
    <svg
      viewBox="0 0 40 30"
      className="h-full w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <rect x="1" y="1" width="38" height="28" rx="1" />
      <circle cx="12" cy="10" r="3" />
      <path d="M1 23 L13 13 L20 19 L28 9 L39 21" />
    </svg>
  );
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
  // text by word index (see rationale below). Structured into headline +
  // body + image "blocks" laid out on a real grid (rather than one flat
  // blob or a flowing multi-column) so the page reads as an actual
  // front-page module, not a wall of grey text.
  const blocks = useMemo(() => buildBlocks(repeat), [repeat]);

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
              overflow the viewport so the grid never runs dry and leaves
              a blank gap on large monitors. Laid out as an actual CSS
              grid of story modules — dominant 2-column headline+body,
              1-column stories, and image-placeholder modules with a
              cutline — rather than flowing multi-column text, since real
              front pages are a grid of boxed stories with headlines and
              photos spanning columns, not one continuous text flow.
              `dense` packing lets smaller blocks fill gaps left by wider
              ones instead of leaving holes. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden p-3 sm:p-6"
          >
            <div
              className="grid h-full w-full auto-rows-min grid-cols-3 gap-x-3 gap-y-3 [grid-auto-flow:dense] sm:grid-cols-6 lg:grid-cols-9"
            >
              {blocks.map((block, i) => {
                const spanClass =
                  block.type === "regular"
                    ? "col-span-1"
                    : "col-span-2 lg:col-span-3";
                const isFirstTextBlock = i === 0;

                if (block.type === "image") {
                  return (
                    <div key={i} className={`${spanClass} mb-2.5`}>
                      <div className="flex aspect-[4/3] items-center justify-center border border-dashed border-line-strong bg-bg-elevated/40 p-3 text-muted/30">
                        <ImagePlaceholderIcon />
                      </div>
                      <div className="mt-1 h-px w-full bg-line" />
                      <p className="mt-1 text-center text-[7px] italic leading-tight text-muted/30 sm:text-[8px]">
                        {block.caption}
                      </p>
                    </div>
                  );
                }

                const isFeature = block.type === "feature";
                return (
                  <div key={i} className={`${spanClass} mb-2.5`}>
                    <p
                      className={
                        isFeature
                          ? "mb-0.5 font-display text-[11px] font-bold uppercase leading-tight tracking-tight text-muted/45 sm:text-sm"
                          : "mb-0.5 font-display text-[8px] font-semibold uppercase leading-tight tracking-tight text-muted/35 sm:text-[9px]"
                      }
                    >
                      {block.headline}
                    </p>
                    <div className="mb-1 h-px w-6 bg-line" />
                    <p
                      className={`text-justify text-[8px] leading-[1.5] text-muted/25 sm:text-[9px] ${
                        isFirstTextBlock
                          ? "first-letter:float-left first-letter:mr-1 first-letter:font-display first-letter:text-2xl first-letter:font-bold first-letter:leading-[0.8] first-letter:text-muted/45 sm:first-letter:text-3xl"
                          : ""
                      }`}
                    >
                      {block.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive name target, anchored to a fixed spot in the
              viewport rather than to a position inside the word flow
              above — its location no longer depends on word count or
              column math, so it lands in the same reliable place on
              every screen size instead of drifting off-screen.
              Styled as a boxed classified notice (dashed cut-line +
              corner crop-marks) rather than blended into the body text —
              real newspapers box out ads and notices like this, so it
              reads as part of the page rather than a floating UI element
              even though it's visually distinct from the grey filler. */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
            <button
              type="button"
              onMouseEnter={trigger}
              onFocus={trigger}
              onClick={trigger}
              className="group corner-brackets pointer-events-auto relative border border-dashed border-line-strong bg-bg px-4 py-2.5 outline-none sm:cursor-none"
            >
              <span className="block text-center font-mono text-[11px] font-medium tracking-widest text-accent-2 sm:text-xs">
                Wanted
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
