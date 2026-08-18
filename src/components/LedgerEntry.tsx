"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { profile, type TimelineEntry } from "@/lib/data";

/** Fades a single element in on mount, one after another — same helper
 * as CaseFile.tsx's RevealOnMount, kept local since this page has no
 * shared-photo morph to keep in step with (only the period stamp does). */
function RevealOnMount({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

const fadeUp: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function LedgerEntry({
  entry,
  related,
}: {
  entry: TimelineEntry;
  related: { entry: TimelineEntry; href: string }[];
}) {
  const record = entry.record;
  if (!record) return null;

  return (
    <main>
      {/* Breadcrumb bar */}
      <div className="border-b-2 border-black bg-bg">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          <Link
            href="/#timeline"
            scroll={false}
            className="font-bold text-ink transition-colors hover:text-accent-2"
          >
            ← Back to the ledger
          </Link>
          <span>{profile.name} · Career Log</span>
          <span>Filed from {profile.location}</span>
        </div>
      </div>

      {/* Header: eyebrow, headline, dek, byline */}
      <header className="mx-auto max-w-6xl px-6 pt-10 sm:pt-14">
        <RevealOnMount delay={0}>
          <span className="block font-mono text-xs font-bold uppercase tracking-[0.18em] text-accent-2">
            Ledger Entry ·{" "}
            <motion.span
              layoutId={`timeline-period-${entry.slug}`}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block"
            >
              {entry.period}
            </motion.span>
          </span>
        </RevealOnMount>

        <RevealOnMount delay={0.08}>
          <h1 className="mt-2 max-w-[22ch] font-display text-[clamp(34px,6vw,68px)] font-semibold leading-[1.03] tracking-[-0.02em] text-ink">
            {entry.org}
          </h1>
        </RevealOnMount>

        <RevealOnMount delay={0.16}>
          <p className="mt-4 max-w-[56ch] border-l-4 border-ink pl-[18px] font-display text-[clamp(17px,1.8vw,21px)] italic leading-[1.5] text-muted">
            {record.dek}
          </p>
        </RevealOnMount>

        <RevealOnMount delay={0.24}>
          <p className="mt-4 font-mono text-xs font-semibold uppercase tracking-[0.06em] text-muted">
            By <b className="text-ink">The Records Desk</b> &nbsp;·&nbsp; {entry.role}
          </p>
        </RevealOnMount>
      </header>

      {/* Record card — stands in for the exhibit photo on the case-file
          page: there's no screenshot for an education record, so the
          headline stat gets the same framed, captioned treatment instead. */}
      <figure className="mx-auto mt-7 max-w-6xl px-6">
        <div className="relative border border-ink/25 bg-bg p-2 pb-0 shadow-[0_2px_14px_rgba(22,20,15,0.14)]">
          <span
            aria-hidden="true"
            className="absolute -top-2 left-1/2 z-[1] h-4 w-16 -translate-x-1/2 -rotate-2 border border-ink/10 bg-bg-elevated/75"
          />
          <div className="relative flex aspect-[2/1] w-full flex-col items-center justify-center overflow-hidden border border-ink/40 bg-bg-elevated/50">
            <span className="font-display text-[clamp(48px,9vw,96px)] font-semibold leading-none tracking-[-0.02em] text-ink">
              {record.stat.value}
            </span>
            <span className="mt-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted">
              {record.stat.label}
            </span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-2.5 top-2.5 -rotate-[8deg] border-[3px] border-accent-2 bg-bg/85 px-2.5 py-1 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-accent-2"
            >
              On record
            </span>
          </div>
          <figcaption className="flex items-center justify-between gap-3 px-1 py-1.5 font-mono text-[12px] tracking-[0.02em] text-muted">
            <span className="shrink-0 font-bold uppercase text-ink">
              {entry.org}
            </span>
            <span className="truncate">Fig. 1 — standing at time of record</span>
          </figcaption>
        </div>
      </figure>

      {/* Article + sidebar */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.6fr_1fr]">
            <motion.article
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="font-body text-[16.5px] leading-[1.7] text-ink/90 [hyphens:auto] text-justify"
            >
              {record.paragraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "mb-4 first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:font-display first-letter:text-[60px] first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-ink"
                      : "mb-4"
                  }
                >
                  {paragraph}
                </p>
              ))}

              <blockquote className="my-6 border-y-2 border-ink py-4 text-center font-display text-[22px] italic leading-[1.3] text-ink">
                &ldquo;{record.pullQuote}&rdquo;
              </blockquote>

              <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted">
                Standing: {record.standing}
              </p>
            </motion.article>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              className="border-2 border-ink"
            >
              <div className="bg-ink px-4 py-[9px] font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-bg">
                Record Details
              </div>

              <div className="divide-y divide-line">
                <SpecRow label="Role" value={entry.role} />
                <SpecRow label="Institution" value={entry.org} />
                <SpecRow label="Period" value={entry.period} />
                <SpecRow label="Standing" value={record.standing} />
              </div>

              {related.length > 0 && (
                <div className="border-t border-line bg-bg-elevated px-4 py-4">
                  <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                    Related records
                  </p>
                  {related.map(({ entry: r, href }) => (
                    <Link
                      key={href}
                      href={href}
                      className="mb-2 block w-fit font-display text-[15px] text-ink underline decoration-line-strong underline-offset-4 transition-colors last:mb-0 hover:text-accent-2 hover:decoration-accent-2"
                    >
                      {r.period} — {r.org}
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Footer nav */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t-4 border-ink pt-5">
            <Link
              href="/#timeline"
              scroll={false}
              className="inline-flex items-center gap-2.5 border-2 border-ink px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-bg"
            >
              ← Back to the ledger
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[1fr_1.4fr] gap-3 px-4 py-3">
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
        {label}
      </span>
      <span className="font-mono text-[13px] text-ink">{value}</span>
    </div>
  );
}
