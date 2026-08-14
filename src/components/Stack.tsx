"use client";

import { motion } from "framer-motion";
import { stack, type StackItem } from "@/lib/data";

// "Finding" stamp text + whether this entry gets the highlighted (accent)
// stamp treatment vs. the neutral ink one. Content values (entry.detail,
// entry.code, entry.name) are untouched — this only maps the existing
// `status` field to the descriptor shown in the "Detected" column.
const statusMeta: Record<StackItem["status"], { label: string; primary: boolean }> = {
  daily: { label: "Daily use", primary: true },
  comfortable: { label: "Comfortable", primary: false },
  learning: { label: "Learning", primary: false },
};

export default function Stack() {
  return (
    <section id="stack" className="paper-grain px-5 py-14 sm:px-[30px] sm:py-[76px]">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-[30px]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: "easeOut" as const }}
            className="flex flex-wrap items-baseline justify-between gap-5 pb-2.5"
          >
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-ink">
                Forensics
              </span>
              <h2 className="mt-1.5 font-display text-[clamp(30px,4vw,46px)] font-normal leading-[1.02] tracking-[-0.015em] text-ink">
                The Lab Report
              </h2>
            </div>
            <span className="whitespace-nowrap font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Substances detected on the subject, as of this edition
            </span>
          </motion.div>
          <div className="h-1 bg-ink" />
        </div>

        <div className="border-2 border-ink">
          <div className="hidden grid-cols-[2.4fr_1fr_1fr_1.3fr] bg-ink font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-bg sm:grid">
            <span className="border-r border-bg/25 px-4 py-[9px]">Substance</span>
            <span className="border-r border-bg/25 px-4 py-[9px]">Code</span>
            <span className="border-r border-bg/25 px-4 py-[9px]">Detected</span>
            <span className="px-4 py-[9px] text-right">Finding</span>
          </div>

          {stack.map((entry, i) => {
            const meta = statusMeta[entry.status];
            const rotate = meta.primary
              ? "-rotate-[1.5deg]"
              : i % 2 === 0
                ? "rotate-[1deg]"
                : "-rotate-[1deg]";
            return (
              <motion.div
                key={entry.code}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, ease: "easeOut" as const, delay: i * 0.04 }}
                className="grid gap-2 border-t border-ink/25 px-3.5 py-3.5 font-mono transition-colors first:border-t-0 hover:bg-bg-elevated sm:grid-cols-[2.4fr_1fr_1fr_1.3fr] sm:items-center sm:gap-0 sm:px-0 sm:py-0"
              >
                <span className="flex min-w-0 items-baseline justify-between gap-3 sm:block sm:border-r sm:border-ink/25 sm:px-4 sm:py-[11px]">
                  <span className="truncate font-display !text-[19px] tracking-normal sm:tracking-[-0.01em]">
                    {entry.name}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted sm:hidden">
                    {entry.code}
                  </span>
                </span>
                <span className="hidden border-r border-ink/25 px-4 py-[11px] text-[13px] text-muted sm:block">
                  {entry.code}
                </span>
                <span className="text-[12px] uppercase tracking-[0.08em] text-muted sm:border-r sm:border-ink/25 sm:px-4 sm:py-[11px] sm:text-[13px] sm:normal-case sm:tracking-normal sm:text-ink">
                  {meta.label}
                </span>
                <span className="sm:px-4 sm:py-[9px] sm:text-right">
                  <span
                    className={`inline-block border-2 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-[0.14em] ${rotate} ${
                      meta.primary ? "border-accent-2 text-accent-2" : "border-ink/60 text-ink"
                    }`}
                  >
                    {entry.detail}
                  </span>
                </span>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-3 text-left font-mono text-[11px] font-medium tracking-[0.04em] text-muted sm:text-right">
          Findings are illustrative — what he reaches for day to day, not a ranking.
        </p>
      </div>
    </section>
  );
}
