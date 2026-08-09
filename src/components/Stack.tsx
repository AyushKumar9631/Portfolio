"use client";

import { motion } from "framer-motion";
import { stack, type StackItem } from "@/lib/data";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const statusMeta: Record<
  StackItem["status"],
  { label: string; dot: string }
> = {
  daily: { label: "Daily use", dot: "bg-accent" },
  comfortable: { label: "Comfortable", dot: "bg-accent-2" },
  learning: { label: "Learning", dot: "bg-muted" },
};

export default function Stack() {
  return (
    <section id="stack" className="paper-grain px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="mb-12 flex flex-wrap items-end justify-between gap-4 border-b border-line-strong pb-4"
        >
          <div>
            <span className="font-mono text-xs tracking-widest text-accent-2">
              READOUT
            </span>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
              Stack
            </h2>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] tracking-widest text-muted">
            {(Object.keys(statusMeta) as StackItem["status"][]).map(
              (status) => (
                <span key={status} className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${statusMeta[status].dot}`}
                  />
                  {statusMeta[status].label.toUpperCase()}
                </span>
              ),
            )}
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="corner-brackets divide-y divide-line border border-line bg-bg"
        >
          {stack.map((entry) => (
            <motion.div
              key={entry.code}
              variants={item}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-bg-elevated sm:flex-nowrap"
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${statusMeta[entry.status].dot}`}
                aria-hidden="true"
              />
              <span className="w-14 shrink-0 font-mono text-xs tracking-widest text-muted">
                {entry.code}
              </span>
              <span className="font-display text-base font-semibold text-ink sm:w-48 sm:shrink-0">
                {entry.name}
              </span>
              <span className="text-sm text-muted sm:flex-1">
                {entry.detail}
              </span>
              <span className="ml-auto shrink-0 font-mono text-[10px] tracking-widest text-muted sm:ml-0">
                {statusMeta[entry.status].label.toUpperCase()}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
