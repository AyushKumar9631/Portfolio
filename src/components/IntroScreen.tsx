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
// tiled down the page instead of one flat column of text. Each story
// also carries a kicker (the small section label above a headline) and a
// byline, the way real front-page copy always identifies its section and
// author rather than just running headline-into-body.
type BlockType = "feature" | "regular" | "image";

type Block = {
  type: BlockType;
  kicker: string;
  headline: string;
  byline: string;
  body: string;
  // Hand-split halves for the dominant "feature" story's two-column body.
  // Deliberately NOT CSS `columns-2` — that lets the browser's column-
  // balance algorithm decide the split, and when a grid parent stretches
  // the item's height, the algorithm can leave the second column mostly
  // (or entirely) blank. Splitting the word list ourselves guarantees
  // both columns are populated every time.
  bodyColumns?: [string, string];
  caption?: string;
};

const KICKERS = [
  "WORLD",
  "MARKETS",
  "TECHNOLOGY",
  "OPINION",
  "CULTURE",
  "SCIENCE",
  "POLITICS",
  "SPORT",
  "BUSINESS",
  "REGIONAL",
];

function capitalize(word: string) {
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}

// Deterministic 50/50 split (ceil so an odd word out goes to column one,
// same as a real typeset column) — no browser balancing involved, so
// there's no way for one side to come up short.
function splitInHalf(words: string[]): [string, string] {
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

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
// separate word source, since none of this text is meant to be read. A
// rotating kicker and a two-word "byline" (also lifted from the chunk's
// own words, capitalized) are layered on the same way, purely for
// newspaper texture. Every 5th block becomes a dominant "feature"
// (hand-split two-column headline+body) and the block after it becomes
// an "image" module (placeholder graphic + one-line cutline instead of
// body copy) — a fixed rhythm rather than random, so the page reads as
// deliberately edited rather than noisy.
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
    const byline = `By ${capitalize(body[0])} ${capitalize(body[1] ?? body[0])}`;
    const kicker = KICKERS[index % KICKERS.length];
    const cycle = index % 5;
    index += 1;
    if (cycle === 3) {
      blocks.push({
        type: "image",
        kicker,
        headline,
        byline,
        body: body.join(" "),
        caption: body.slice(0, 4).join(" "),
      });
    } else if (cycle === 0) {
      blocks.push({
        type: "feature",
        kicker,
        headline,
        byline,
        body: body.join(" "),
        bodyColumns: splitInHalf(body),
      });
    } else {
      blocks.push({
        type: "regular",
        kicker,
        headline,
        byline,
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
            className="pointer-events-none absolute inset-0 overflow-hidden p-[clamp(12px,1.56vw,32px)]"
          >
            <div
              className="grid h-full w-full auto-rows-min grid-cols-3 gap-x-[clamp(8px,0.78vw,16px)] gap-y-[clamp(8px,0.78vw,16px)] [grid-auto-flow:dense] sm:grid-cols-6 lg:grid-cols-9"
            >
              {blocks.map((block, i) => {
                // Only the HEADLINE spans the story's full column width, the
                // way a real front-page headline banners over its columns.
                // The body text underneath stays column-width — laid out as
                // a hand-split two-column grid for the dominant story (see
                // `splitInHalf`), rather than stretched into one wide
                // paragraph, or a 2-column-wide "story" just reads as an
                // oversized single column of text, not an actual newspaper
                // spread.
                const isFeature = block.type === "feature";
                const headlineSpanClass = isFeature
                  ? "col-span-2 lg:col-span-3"
                  : "col-span-1";
                const isFirstTextBlock = i === 0;
                const dropCapClass = isFirstTextBlock
                  ? "first-letter:float-left first-letter:mr-1 first-letter:font-display first-letter:text-[clamp(20px,1.67vw,26px)] first-letter:font-bold first-letter:leading-[0.8] first-letter:text-muted/45"
                  : "";

                // All font sizes and the image module's box width below use
                // `clamp(min, Nvw, max)` rather than a fixed px value or a
                // sm:/lg: breakpoint pair — the preferred (middle) term is
                // tuned so the computed size lands on the old "desktop"
                // value at a 1536px-wide viewport (a standard 15.6" laptop's
                // logical resolution), while the min/max bounds keep it
                // sane on phones and ultrawide monitors. Hairline rules and
                // dividers are left in px on purpose: a real column rule
                // doesn't get thicker on a bigger screen.
                const kickerClass =
                  "font-mono text-[clamp(7px,0.52vw,10px)] font-semibold uppercase tracking-widest text-accent-2/50";
                const bylineClass =
                  "mb-1 font-body text-[clamp(7px,0.52vw,10px)] italic text-muted/35";
                const bodyTextClass =
                  "text-justify text-[clamp(8px,0.59vw,12px)] leading-[1.5] text-muted/25";

                if (block.type === "image") {
                  // Deliberately kept to a single narrow column and capped
                  // with an explicit max-width — a photo module in this
                  // texture should read as a small inset graphic among the
                  // text, not a dominant block that outweighs everything
                  // around it.
                  return (
                    <div key={i} className="col-span-1 mb-2.5">
                      <p className={`${kickerClass} mb-0.5 text-center`}>
                        {block.kicker}
                      </p>
                      <div className="mx-auto flex aspect-[4/3] max-w-[clamp(72px,6vw,120px)] items-center justify-center border border-dashed border-line-strong bg-bg-elevated/40 p-1.5 text-muted/30">
                        <ImagePlaceholderIcon />
                      </div>
                      <div className="mx-auto mt-1 h-px w-full max-w-[clamp(72px,6vw,120px)] bg-line" />
                      <p className="mx-auto mt-1 max-w-[clamp(72px,6vw,120px)] text-center text-[clamp(6px,0.46vw,9px)] italic leading-tight text-muted/30">
                        {block.caption}
                      </p>
                    </div>
                  );
                }

                return (
                  <div key={i} className={`${headlineSpanClass} mb-2.5`}>
                    <p className={`${kickerClass} mb-0.5`}>{block.kicker}</p>
                    <p
                      className={
                        isFeature
                          ? "mb-0.5 font-display text-[clamp(11px,0.91vw,18px)] font-bold uppercase leading-tight tracking-tight text-muted/45"
                          : "mb-0.5 font-display text-[clamp(8px,0.59vw,12px)] font-semibold uppercase leading-tight tracking-tight text-muted/35"
                      }
                    >
                      {block.headline}
                    </p>
                    <p className={bylineClass}>{block.byline}</p>
                    <div className="mb-1 h-px w-6 bg-line" />
                    {isFeature && block.bodyColumns ? (
                      <div className="grid grid-cols-2 gap-x-[clamp(8px,0.7vw,14px)]">
                        <p
                          className={`${bodyTextClass} border-r border-line pr-[clamp(4px,0.4vw,8px)] ${dropCapClass}`}
                        >
                          {block.bodyColumns[0]}
                        </p>
                        <p className={`${bodyTextClass} pl-[clamp(4px,0.4vw,8px)]`}>
                          {block.bodyColumns[1]}
                        </p>
                      </div>
                    ) : (
                      <p className={`${bodyTextClass} ${dropCapClass}`}>
                        {block.body}
                      </p>
                    )}
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
              <span className="block text-center font-mono text-[clamp(11px,0.78vw,16px)] font-medium tracking-widest text-accent-2">
                Wanted
              </span>
              <span className="block text-center font-display text-[clamp(14px,1.04vw,21px)] font-bold text-ink">
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
            className="absolute right-6 top-6 border border-line-strong bg-bg px-3 py-1.5 font-mono text-[clamp(10px,0.65vw,13px)] tracking-widest text-muted transition-colors hover:border-accent hover:text-ink sm:cursor-none"
          >
            SKIP INTRO
          </button>

          <motion.p
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-bg px-3 font-mono text-[clamp(12px,0.78vw,16px)] tracking-widest text-muted"
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
