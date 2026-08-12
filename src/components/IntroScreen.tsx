"use client";

import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

// Once the visitor has traced the name (or hit skip) this tab session, the
// intro shouldn't play again — most importantly when they leave a case
// file via "Back to the evidence" and land back on "/": that's a fresh
// mount of this component (Next remounts the page segment on navigation,
// it doesn't keep IntroScreen's state around), so without this flag it
// would replay the whole newspaper-loading sequence instead of just
// showing the homepage. sessionStorage (not localStorage) so it still
// plays once for a genuinely new visit/tab, just not on every back-nav.
const INTRO_SEEN_KEY = "intro-seen";

function hasSeenIntro() {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    // Storage unavailable (private mode, disabled, etc.) — the intro will
    // just replay on the next mount, which is a harmless fallback.
  }
}

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
// `computeRepeat()`'s `typeof window === "undefined"` branch is ONLY ever
// true on the actual server — during the client's first hydration render,
// `window` already exists in the browser, so that branch never runs
// client-side. If `repeat`'s initial state were seeded by calling
// computeRepeat() directly, the server would render with this fallback
// while the client's very first render would immediately compute a real,
// viewport-based value instead — a structural mismatch (different block
// count = different number of DOM nodes) on every single page load,
// which is exactly what throws React hydration error #418 and forces a
// full client-side re-render, discarding whatever the server sent down.
// Keeping this as a named constant used in BOTH places guarantees the
// server's output and the client's first render are byte-for-byte
// identical; the real viewport-based value is only computed afterward,
// in a useEffect that runs post-hydration (see below).
const SSR_SAFE_REPEAT = 10;

// Words per faux "block" within the page flow. Kept short so several
// blocks stack per column, like a real front page.
const WORDS_PER_ARTICLE = 110;

// --- Why this is a CSS multi-column flow and not a CSS Grid ---
// The previous version laid blocks out on a CSS Grid (`grid-auto-flow:
// dense`, `auto-rows-min`). That looked right in a quick check but was
// structurally guaranteed to leave blank gaps: Grid auto-placement puts
// several blocks of very different heights into the *same row* (a short
// "regular" story next to a tall "feature" story), and the row track's
// height is set by the tallest item in it. Every shorter item in that row
// stops short of the row's bottom, leaving a blank band before the next
// row starts — visible as exactly the kind of hole in the middle of a
// column seen in the screenshot, not just at the very end of the page.
// No amount of alignment tweaking fixes this: the row height itself is
// wrong for the shorter items, so blank space is unavoidable as long as
// unrelated-height items are forced to share a row.
//
// A CSS multi-column container (`columns-N` + `column-fill: auto`) has no
// row concept at all. Content just flows down column 1 like a normal
// document, and once it reaches the container's height it continues at
// the top of column 2, and so on — exactly how a real newspaper column
// flows. Each block only ever takes the vertical space its own content
// needs, so there is no shared track for a short block to fall short of.
// A gap simply cannot appear in the middle of a column with this model.
// The one trade-off: a block can no longer span 2–3 of the fine columns
// the way the old "feature" story did (multi-column has no partial-span),
// so the dominant story is now distinguished by size/weight alone rather
// than width — still reads as the lead story, just via type scale.
type BlockType = "feature" | "regular" | "image";

type Block = {
  type: BlockType;
  kicker: string;
  headline: string;
  byline: string;
  body: string;
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

function computeRepeat() {
  if (typeof window === "undefined") return SSR_SAFE_REPEAT; // matches the client's initial state below
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
// newspaper texture. Every 5th block becomes a dominant "feature" (bigger
// headline, more weight) and the block after it becomes an "image" module
// (placeholder graphic + one-line cutline instead of body copy) — a fixed
// rhythm rather than random, so the page reads as deliberately edited
// rather than noisy.
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
    } else {
      blocks.push({
        type: cycle === 0 ? "feature" : "regular",
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

// All font sizes and the image module's box width below use
// `clamp(min, Nvw, max)` rather than a fixed px value or a sm:/lg:
// breakpoint pair — the preferred (middle) term is tuned so the computed
// size lands on the old "desktop" value at a 1536px-wide viewport (a
// standard 15.6" laptop's logical resolution), while the min/max bounds
// keep it sane on phones and ultrawide monitors. Hairline rules and
// dividers are left in px on purpose: a real column rule doesn't get
// thicker on a bigger screen. Hoisted to module scope (rather than
// recomputed inside the block map callback) since the Wanted ad block
// now splits the filler render into two passes and both need them.
const KICKER_CLASS =
  "font-mono text-[clamp(7px,0.52vw,10px)] font-semibold uppercase tracking-widest text-accent-2/50";
const BYLINE_CLASS =
  "mb-1 font-body text-[clamp(7px,0.52vw,10px)] italic text-muted/35";
const BODY_TEXT_CLASS =
  "text-justify text-[clamp(8px,0.59vw,12px)] leading-[1.5] text-muted/25";

// One filler block — extracted to its own component so it can be
// rendered in two separate passes (before/after the Wanted ad) without
// duplicating this markup.
const FillerBlock = forwardRef<
  HTMLDivElement,
  { block: Block; i: number; ariaHidden?: boolean }
>(function FillerBlock({ block, i, ariaHidden }, ref) {
  const isFeature = block.type === "feature";
  const isFirstTextBlock = i === 0;
  const dropCapClass = isFirstTextBlock
    ? "first-letter:float-left first-letter:mr-1 first-letter:font-display first-letter:text-[clamp(20px,1.67vw,26px)] first-letter:font-bold first-letter:leading-[0.8] first-letter:text-muted/45"
    : "";

  if (block.type === "image") {
    // Deliberately kept to a single narrow column and capped with an
    // explicit max-width — a photo module in this texture should read
    // as a small inset graphic among the text, not a dominant block
    // that outweighs everything around it.
    return (
      <div
        ref={ref}
        className="mb-2.5 break-inside-avoid"
        aria-hidden={ariaHidden}
      >
        <p className={`${KICKER_CLASS} mb-0.5 text-center`}>{block.kicker}</p>
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
    <div ref={ref} className="mb-2.5" aria-hidden={ariaHidden}>
      <div className="break-inside-avoid">
        <p className={`${KICKER_CLASS} mb-0.5`}>{block.kicker}</p>
        <p
          className={
            isFeature
              ? "mb-0.5 font-display text-[clamp(11px,0.91vw,18px)] font-bold uppercase leading-tight tracking-tight text-muted/45"
              : "mb-0.5 font-display text-[clamp(8px,0.59vw,12px)] font-semibold uppercase leading-tight tracking-tight text-muted/35"
          }
        >
          {block.headline}
        </p>
        <p className={BYLINE_CLASS}>{block.byline}</p>
        <div className="mb-1 h-px w-6 bg-line" />
      </div>
      <p className={`${BODY_TEXT_CLASS} ${dropCapClass}`}>{block.body}</p>
    </div>
  );
});

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  // Lazy initializer only runs client-side on mount (never during SSR, and
  // client-side route navigations — the case only relevant here — never
  // hydrate against server markup anyway), so reading sessionStorage here
  // can't cause a hydration mismatch the way seeding it into computeRepeat
  // below would.
  const [visible, setVisible] = useState(() => !hasSeenIntro());
  const [revealing, setRevealing] = useState(false);
  const [repeat, setRepeat] = useState(SSR_SAFE_REPEAT);
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
  // byline + body "blocks" flowing down a real multi-column layout
  // (rather than a grid or one flat blob) so the page reads as an actual
  // front-page module, not a wall of grey text, and so it can never leave
  // a blank hole partway down a column (see the multi-column rationale
  // above `BlockType`).
  const blocks = useMemo(() => buildBlocks(repeat), [repeat]);

  // --- Why the split index is measured, not a fixed fraction ---
  // An earlier version used `blocks.length / 2` directly. That looked
  // reasonable but was wrong: `blocks` is deliberately OVER-generated
  // (see WORDS_PER_PX2 above) so the columns never run dry at the
  // bottom, and that overflow is intentionally uncapped — it grows with
  // viewport area while the column *count* caps out at 9 (`lg:columns-9`)
  // for anything wide. So "50% of the array" routinely lands well past
  // however many blocks actually fit in the visible 9-column area, and
  // CSS multi-column doesn't drop that overflow — it just keeps adding
  // column tracks off the right edge, which `overflow-hidden` on the
  // ancestor then clips. Net effect: the ad silently rendered off-screen
  // on ordinary viewports, not just huge ones. There's no reliable
  // constant to swap in either, since the true "blocks per column" count
  // depends on real font metrics that vary by browser/OS/zoom — exactly
  // the kind of thing that has to be measured, not guessed.
  //
  // So: render with a conservative placeholder index first (guaranteed
  // to be near the top, i.e. always on-screen), then — after the browser
  // has actually laid the columns out — measure one real rendered block's
  // height plus the column container's real height, derive how many
  // blocks truly fit across the visible columns, and re-render with the
  // ad at the midpoint of THAT number instead. useLayoutEffect runs and
  // commits before the browser paints, so this correction happens before
  // the user ever sees the placeholder position.
  const PLACEHOLDER_FRACTION = 0.25;
  const [midIndex, setMidIndex] = useState(() =>
    Math.max(1, Math.floor(blocks.length * PLACEHOLDER_FRACTION)),
  );
  const safeMidIndex = Math.min(Math.max(1, midIndex), Math.max(1, blocks.length - 1));

  const columnsRef = useRef<HTMLDivElement>(null);
  const sampleBlockRef = useRef<HTMLDivElement>(null);
  // Sample a "regular" block specifically (not the always-larger "feature"
  // block at index 0, and not the differently-shaped "image" block) so the
  // measured height is representative of the majority of blocks.
  const sampleBlockIndex = useMemo(() => {
    const idx = blocks.findIndex((b) => b.type === "regular");
    return idx === -1 ? 0 : idx;
  }, [blocks]);

  useLayoutEffect(() => {
    const container = columnsRef.current;
    const sample = sampleBlockRef.current;
    if (!container || !sample) return;
    const containerHeight = container.clientHeight;
    const sampleStyle = window.getComputedStyle(sample);
    const sampleHeight =
      sample.getBoundingClientRect().height +
      (parseFloat(sampleStyle.marginBottom) || 0);
    const columnCount =
      parseInt(window.getComputedStyle(container).columnCount, 10) || 3;
    if (containerHeight <= 0 || sampleHeight <= 0) return;
    const blocksPerColumn = Math.max(1, Math.floor(containerHeight / sampleHeight));
    const visibleCapacity = blocksPerColumn * columnCount;
    const target = Math.max(
      1,
      Math.min(blocks.length - 1, Math.floor(visibleCapacity / 2)),
    );
    setMidIndex(target);
    // Re-measure whenever `blocks` changes identity (the resize listener
    // above regenerates it), so the ad stays correctly placed after a
    // resize/breakpoint change too, not just on first mount.
  }, [blocks]);

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
    markIntroSeen();
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
              a blank gap at the bottom of the page. `columns-N` +
              `column-fill: auto` flows blocks straight down column 1,
              then column 2, etc. — normal document flow per column, with
              no shared row to force a blank band under a short block (see
              the full rationale above `BlockType`).

              Only the small kicker+headline+byline cluster gets
              `break-inside-avoid` (so a headline is never orphaned alone
              at the very bottom of a column with none of its own body
              beneath it). The body paragraph itself is left free to break
              across a column boundary. A whole block here (header + ~110
              words of body) can run 250–350px tall, easily more than one
              "slice" of a short column — marking the *entire* block
              unbreakable would force the browser to defer the whole thing
              to the next column whenever it didn't quite fit the space
              left in the current one, leaving exactly the kind of blank
              band at the bottom of a column this is meant to prevent.
              Letting body text break, the way body copy always does at
              the bottom of a real newspaper column, fills every column
              right up to its edge with no exceptions. */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden p-[clamp(12px,1.56vw,32px)]">
            <div
              ref={columnsRef}
              className="h-full w-full columns-3 gap-x-[clamp(8px,0.78vw,16px)] sm:columns-6 lg:columns-9 [column-fill:auto]"
            >
              {/* Decorative filler, part one. aria-hidden is applied per
                  block (not via a wrapping div — a nested container breaks
                  CSS multi-column fragmentation, see note above `columns-N`
                  usage) since none of this text is meant to be read. One
                  block also carries sampleBlockRef so its real rendered
                  height can be measured (see the split-index rationale
                  above). */}
              {blocks.slice(0, safeMidIndex).map((block, i) => (
                <FillerBlock
                  key={i}
                  block={block}
                  i={i}
                  ariaHidden
                  ref={i === sampleBlockIndex ? sampleBlockRef : undefined}
                />
              ))}

              {/* The Wanted ad itself: a genuine flow child of the SAME
                  multi-column container the filler text lives in, sitting
                  between the two filler passes above/below — not a second
                  absolutely-positioned layer stacked on top of the page.
                  Because it occupies real space in the column flow, the
                  surrounding grey text simply flows around it instead of
                  being overlapped or hidden underneath it, the same way a
                  classified ad box sits inside an actual newspaper column.
                  Styled as a boxed notice (dashed cut-line + corner
                  crop-marks) so it reads as an ad amid the columns rather
                  than blending into the article text around it. Not
                  aria-hidden: this is the real control that enters the
                  site, so it must stay in the accessibility tree even
                  though its filler siblings are hidden from it. */}
              <div className="mb-2.5 break-inside-avoid text-center">
                <button
                  type="button"
                  onMouseEnter={trigger}
                  onFocus={trigger}
                  onClick={trigger}
                  // Boosted from the original hairline `border-line-strong`
                  // (only 28% opacity — nearly invisible against a dense
                  // page of similarly grey filler text) to a heavier,
                  // higher-contrast dashed rule in the same accent-2 brown
                  // already used for the "Wanted" kicker and corner-brackets,
                  // plus the slightly darker `bg-elevated` tone instead of
                  // the page's own background — so the box now reads as a
                  // distinct cut-out ad instead of blending into the column.
                  // Text size/weight intentionally left untouched.
                  className="group corner-brackets pointer-events-auto relative inline-block border-[1.5px] border-dashed border-accent-2/60 bg-bg-elevated px-4 py-2.5 shadow-sm transition-colors hover:border-accent-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated sm:cursor-none"
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

              {/* Decorative filler, part two. */}
              {blocks.slice(safeMidIndex).map((block, i) => {
                const globalIndex = safeMidIndex + i;
                return (
                  <FillerBlock
                    key={globalIndex}
                    block={block}
                    i={globalIndex}
                    ariaHidden
                    ref={
                      globalIndex === sampleBlockIndex
                        ? sampleBlockRef
                        : undefined
                    }
                  />
                );
              })}
            </div>
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
