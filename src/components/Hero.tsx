"use client";

import { motion } from "framer-motion";
import { hero } from "@/lib/data";

// Same "image not found" glyph (frame + sun + mountains) used as the
// decorative photo placeholder in IntroScreen.tsx — reused here so the
// portrait slot reads as "a photo goes here" without needing real,
// rights-cleared image content.
function ImagePlaceholderIcon() {
  return (
    <svg
      viewBox="0 0 40 30"
      className="h-14 w-14"
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

const STAT_CELL_CLASS = [
  "border-b border-r border-line-strong px-[18px] py-4 sm:border-b-0 sm:border-r",
  "border-b border-line-strong px-[18px] py-4 sm:border-b-0 sm:border-r",
  "border-r border-line-strong px-[18px] py-4 sm:border-r",
  "px-[18px] py-4",
];

export default function Hero() {
  return (
    <section id="hero" className="pb-2 pt-8 sm:pt-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto max-w-6xl px-6"
      >
        {/* Front Page / Filed under strip */}
        <div className="mb-[18px] flex items-center justify-between gap-4 border-b border-line-strong pb-[9px] font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
          <span>{hero.sectionLabel}</span>
          <span>Filed under: {hero.filedUnder}</span>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.55fr_1fr]">
          {/* Left column: headline, quote, CTAs, stats */}
          <div>
            <span className="block font-mono text-xs font-bold uppercase tracking-[0.18em] text-ink">
              Case No. {hero.caseNumber} — {hero.statusLabel}
            </span>

            <h1 className="mt-1 font-display text-[clamp(40px,6.6vw,86px)] font-semibold leading-none tracking-tight text-ink">
              {hero.headlineLead}
              <em className="italic">{hero.headlineEmphasis}</em>
            </h1>

            <p className="mt-5 max-w-[30ch] border-l-4 border-ink pl-[18px] font-display text-[clamp(18px,2vw,23px)] italic leading-[1.45] text-muted">
              {hero.pullQuote}
            </p>

            <div className="mt-[22px] flex flex-wrap gap-3">
              <a
                href={hero.primaryCta.href}
                className="inline-flex items-center gap-2.5 whitespace-nowrap border-2 border-ink bg-ink px-7 py-[15px] font-mono text-sm font-bold uppercase tracking-[0.1em] text-bg transition-colors hover:bg-transparent hover:text-ink"
              >
                {hero.primaryCta.label} →
              </a>
              <a
                href={hero.secondaryCta.href}
                className="inline-flex items-center gap-2.5 whitespace-nowrap border-2 border-ink bg-transparent px-7 py-[15px] font-mono text-sm font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-bg"
              >
                {hero.secondaryCta.label}
              </a>
            </div>

            <div className="mt-[30px] grid grid-cols-2 border-y-2 border-ink sm:grid-cols-4">
              {hero.stats.map((stat, i) => (
                <div key={stat.label} className={STAT_CELL_CLASS[i]}>
                  <div className="whitespace-nowrap font-display text-[clamp(22px,2.3vw,32px)] leading-none text-ink">
                    {stat.value}
                  </div>
                  <div className="mt-[7px] font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: portrait placeholder + caption + body copy */}
          <div className="border-t-2 border-ink pt-[22px] lg:border-l lg:border-t-0 lg:border-line-strong lg:pl-[34px] lg:pt-0">
            <div className="flex aspect-square w-full items-center justify-center border-2 border-ink bg-bg-elevated/40 text-muted/40">
              <ImagePlaceholderIcon />
            </div>
            <p className="mt-2 font-mono text-[11px] font-medium leading-[1.4] tracking-[0.04em] text-muted">
              <b className="font-bold uppercase tracking-[0.1em] text-ink">
                Pictured:
              </b>{" "}
              {hero.pictureCaption}.
            </p>

            <div className="mt-[18px] font-display text-base leading-[1.6] text-ink [hyphens:auto] [text-align:justify]">
              {hero.body.map((paragraph, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "mb-3 first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-[56px] first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-ink"
                      : "mb-3"
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
