"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { timeline, type TimelineEntry } from "@/lib/data";
import { getLedgerHref, getEarliestTimelineYear } from "@/lib/ledger";

/** "Open record" -> deep-dive page for this entry, either its own
 * /career-log/[slug] or an existing /case-files/[slug] (see
 * getLedgerHref). Mirrors Work.tsx's CaseFileButton. */
function OpenRecordLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      onClick={(e) => e.stopPropagation()}
      className="group/link relative z-20 mt-2 inline-flex items-center gap-1.5 border-b-[1.5px] border-accent-2 pb-0.5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-accent-2 transition-colors hover:border-ink hover:text-ink"
    >
      Open record
      <span className="transition-transform duration-150 group-hover/link:translate-x-1">
        →
      </span>
    </Link>
  );
}

function TimelineRow({ entry, index }: { entry: TimelineEntry; index: number }) {
  const router = useRouter();
  const href = getLedgerHref(entry);
  const isCurrent = entry.period.toLowerCase().includes("now");

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, ease: "easeOut" as const, delay: index * 0.12 }}
      onClick={href ? () => router.push(href) : undefined}
      className={`grid grid-cols-1 items-baseline gap-1.5 border-b border-ink/25 px-1 py-[22px] transition-colors min-[600px]:grid-cols-[170px_1fr_0.9fr] min-[600px]:gap-6 ${
        href ? "group cursor-pointer hover:bg-bg-elevated/40" : ""
      }`}
    >
      <div className="font-mono text-[13px] text-muted">
        <motion.span
          layoutId={entry.slug ? `timeline-period-${entry.slug}` : undefined}
          className="inline-block"
        >
          {entry.period}
        </motion.span>
        {isCurrent && (
          <span className="ml-2 inline-block border border-line-strong px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-accent-2">
            Current
          </span>
        )}
      </div>

      <div className="font-display text-[24px] leading-[1.1] text-ink">
        {entry.role}
        <span className="mt-1.5 block font-mono text-xs font-bold uppercase tracking-[0.12em] text-muted">
          {entry.org}
        </span>
      </div>

      <div className="font-body text-[15px] leading-[1.55] text-muted">
        {entry.detail}
        {href && (
          <>
            <br />
            <OpenRecordLink href={href} />
          </>
        )}
      </div>
    </motion.div>
  );
}

/** Same instant-hash-restore workaround as Work.tsx's useInstantHashRestore,
 * targeting #timeline instead of #work — see that file for the full
 * rationale (keeps the shared layoutId motion the only visible movement
 * when landing back here via a ledger page's "Back to the ledger" link). */
function useInstantHashRestore() {
  useLayoutEffect(() => {
    if (typeof window === "undefined" || window.location.hash !== "#timeline") return;
    const el = document.getElementById("timeline");
    if (!el) return;
    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    el.scrollIntoView({ block: "start" });
    html.style.scrollBehavior = prevBehavior;
  }, []);
}

export default function Timeline() {
  useInstantHashRestore();
  const earliestYear = getEarliestTimelineYear();

  return (
    <section id="timeline" className="px-5 py-14 sm:px-[30px] sm:py-[76px]">
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
                Known Whereabouts
              </span>
              <h2 className="mt-1.5 font-display text-[clamp(30px,4vw,46px)] font-normal leading-[1.02] tracking-[-0.015em] text-ink">
                The Career Ledger
              </h2>
            </div>
            <span className="whitespace-nowrap font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Movements on record since {earliestYear}
            </span>
          </motion.div>
          <div className="h-1 bg-ink" />
        </div>

        <div className="border-t-2 border-ink">
          {timeline.map((entry, i) => (
            <TimelineRow key={`${entry.period}-${entry.role}`} entry={entry} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
