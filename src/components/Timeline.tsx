"use client";

import { motion } from "framer-motion";
import { timeline } from "@/lib/data";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function Timeline() {
  return (
    <section id="timeline" className="bg-bg-elevated px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="mb-12 flex flex-wrap items-end justify-between gap-4 border-b border-line-strong pb-4"
        >
          <div>
            <span className="font-mono text-xs tracking-widest text-accent-2">
              CAREER LOG
            </span>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
              Timeline
            </h2>
          </div>
          <span className="font-mono text-xs tracking-widest text-muted">
            {String(timeline.length).padStart(2, "0")} ENTRIES
          </span>
        </motion.div>

        <motion.ol
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="relative border-l border-line-strong pl-8"
        >
          {timeline.map((entry) => (
            <motion.li
              key={`${entry.period}-${entry.role}`}
              variants={item}
              className="relative pb-12 last:pb-0"
            >
              <span
                className="absolute -left-8 top-1 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-accent bg-bg-elevated"
                aria-hidden="true"
              />

              <span className="font-mono text-xs tracking-widest text-accent-2">
                {entry.period.toUpperCase()}
              </span>
              <h3 className="mt-1 font-display text-xl font-semibold text-ink">
                {entry.role}
              </h3>
              <p className="font-mono text-[11px] tracking-widest text-muted">
                {entry.org.toUpperCase()}
              </p>
              <p className="mt-3 max-w-xl text-sm text-muted">
                {entry.detail}
              </p>

              {entry.period.toLowerCase().includes("now") && (
                <span className="mt-3 inline-block border border-line-strong px-2 py-0.5 font-mono text-[10px] tracking-widest text-accent">
                  CURRENT
                </span>
              )}
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
