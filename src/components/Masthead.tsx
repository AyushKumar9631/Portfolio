"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { profile, masthead } from "@/lib/data";

/** Small inline separator dot used between the byline segments. */
function Dot() {
  return (
    <span aria-hidden="true" className="text-line-strong">
      •
    </span>
  );
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.022, delayChildren: 0.1 } },
};

const charVariant = {
  hidden: { opacity: 0, x: -6 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.22, ease: "easeOut" as const },
  },
};

/** Replaces the static "last updated" date with today's actual date,
 * computed client-side so it's always current, revealed one character
 * at a time left-to-right on every mount (load or refresh). */
function AnimatedDate() {
  const [label, setLabel] = useState("");

  useEffect(() => {
    // Deliberately computed only after mount, never during SSR: the
    // server-rendered HTML can be a day (or more) stale by the time a
    // visitor loads it, so "today" has to come from the browser's own
    // clock, not the render that produced the initial markup.
    const today = new Date()
      .toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      .toUpperCase();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with the browser's clock, not derivable during render/SSR
    setLabel(today);
  }, []);

  return (
    <motion.span
      key={label}
      variants={container}
      initial="hidden"
      animate="show"
      aria-label={label}
      className="inline-flex"
    >
      {Array.from(label).map((char, i) => (
        <motion.span key={i} variants={charVariant} aria-hidden="true">
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export default function Masthead() {
  // "EST." always reflects the current year, the same way Footer.tsx
  // computes its copyright year — no manual upkeep required.
  const year = new Date().getFullYear();

  return (
    <div className="bg-bg">
      {/* Top strip: location — edition name — established year */}
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-6 pt-5 text-center font-mono text-xs tracking-widest text-muted sm:flex-row sm:justify-between">
        <span>{profile.location.toUpperCase()}</span>
        <span className="text-ink">{masthead.edition.toUpperCase()}</span>
        <span>EST. {year}</span>
      </div>

      <div className="mx-auto mt-4 max-w-6xl border-t-2 border-black" />

      {/* Nameplate */}
      <div className="mx-auto max-w-6xl px-6 py-6 text-center sm:py-8">
        <h1 className="font-display text-5xl leading-none tracking-tight text-ink sm:text-6xl md:text-7xl">
          {profile.name}
        </h1>
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-ink">
          {masthead.subhead}
        </p>
      </div>

      <div className="mx-auto max-w-6xl border-t-2 border-black" />

      {/* Byline: last update — current standing — section — price */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-3 text-center font-mono text-xs tracking-widest text-muted">
        <AnimatedDate />
        <Dot />
        <span>{masthead.position.toUpperCase()}</span>
        <Dot />
        <span>{masthead.section.toUpperCase()}</span>
        <Dot />
        <span>PRICE: {masthead.price.toUpperCase()}</span>
      </div>

      <div className="mx-auto max-w-6xl border-b-2 border-black" />
    </div>
  );
}
