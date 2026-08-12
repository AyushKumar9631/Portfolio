"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { profile, type Project } from "@/lib/data";
import { hostFromUrl } from "@/lib/exhibits";

/** Fades a single element in on mount (no slide — the case-file page's
 * only "movement" on open/close is the shared exhibit photo morphing via
 * its layoutId; everything else should just appear) — used for the stack
 * of header elements (eyebrow, headline, dek, byline) so they settle in
 * one after another instead of popping in all at once. */
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

export default function CaseFile({
  project,
  exhibitLabel,
  related,
  relatedLabels,
}: {
  project: Project;
  exhibitLabel: string;
  related: Project[];
  relatedLabels: string[];
}) {
  const kindLabel = project.kind === "internship" ? "Internship" : "Personal";

  return (
    <main>
      {/* Breadcrumb bar */}
      <div className="border-b-2 border-black bg-bg">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          <Link
            href="/#work"
            scroll={false}
            className="font-bold text-ink transition-colors hover:text-accent-2"
          >
            ← Back to the evidence
          </Link>
          <span>{profile.name} · Case Files</span>
          <span>Filed from {profile.location}</span>
        </div>
      </div>

      {/* Header: eyebrow, headline, dek, byline */}
      <header className="mx-auto max-w-6xl px-6 pt-10 sm:pt-14">
        <RevealOnMount delay={0}>
          <span className="block font-mono text-xs font-bold uppercase tracking-[0.18em] text-accent-2">
            Case File · Exhibit {exhibitLabel} · {project.tag}
          </span>
        </RevealOnMount>

        <RevealOnMount delay={0.08}>
          <h1 className="mt-2 max-w-[18ch] font-display text-[clamp(34px,6vw,68px)] font-semibold leading-[1.03] tracking-[-0.02em] text-ink">
            {project.name}
          </h1>
        </RevealOnMount>

        <RevealOnMount delay={0.16}>
          <p className="mt-4 max-w-[56ch] border-l-4 border-ink pl-[18px] font-display text-[clamp(17px,1.8vw,21px)] italic leading-[1.5] text-muted">
            {project.detail.dek}
          </p>
        </RevealOnMount>

        <RevealOnMount delay={0.24}>
          <p className="mt-4 font-mono text-xs font-semibold uppercase tracking-[0.06em] text-muted">
            By <b className="text-ink">The Evidence Desk</b> &nbsp;·&nbsp;{" "}
            {project.period}
          </p>
        </RevealOnMount>
      </header>

      {/* Hero photograph. Plain <figure> now, not a motion component — the
          shared layoutId on the image below already does the only
          animation this region needs (morphing in from/out to its
          thumbnail in the grid); a separate fade/slide on the figure
          around it would just fight that motion and read as a "roll". */}
      <figure className="mx-auto mt-7 max-w-6xl px-6">
        <div className="relative border border-ink/25 bg-bg p-2 pb-0 shadow-[0_2px_14px_rgba(22,20,15,0.14)]">
          <span
            aria-hidden="true"
            className="absolute -top-2 left-1/2 z-[1] h-4 w-16 -translate-x-1/2 -rotate-2 border border-ink/10 bg-bg-elevated/75"
          />
          <motion.div
            layoutId={`exhibit-photo-${project.slug}`}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[2/1] w-full overflow-hidden border border-ink/40 bg-bg-elevated/50"
          >
            {project.screenshot ? (
              <Image
                src={project.screenshot}
                alt={project.name}
                fill
                sizes="(max-width: 1200px) 100vw, 1140px"
                className="object-cover object-top grayscale contrast-[1.04] mix-blend-multiply"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted/70">
                  Screenshot pending
                </span>
              </div>
            )}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-2.5 top-2.5 -rotate-[8deg] border-[3px] border-accent-2 bg-bg/85 px-2.5 py-1 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-accent-2"
            >
              {kindLabel}
            </span>
          </motion.div>
          <figcaption className="flex items-center justify-between gap-3 px-1 py-1.5 font-mono text-[12px] tracking-[0.02em] text-muted">
            <span className="shrink-0 font-bold uppercase text-ink">
              Exhibit {exhibitLabel}
            </span>
            <span className="truncate">
              {project.href
                ? `Fig. 1 — recovered from ${hostFromUrl(project.href)}`
                : `Fig. 1 — recovered from ${project.org}`}
            </span>
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
              className="font-display text-[16.5px] leading-[1.7] text-ink/90 [hyphens:auto] text-justify"
            >
              {project.detail.paragraphs.map((paragraph, i) => (
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
                &ldquo;{project.detail.pullQuote}&rdquo;
              </blockquote>

              <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted">
                Status: {project.status}
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
                How it was built
              </div>

              <div className="divide-y divide-line">
                <SpecRow label="Role" value={project.role} />
                <SpecRow label="Built with" value={project.stack.join(" · ")} />
                <SpecRow label="Org" value={project.org} />
                <SpecRow label="Period" value={project.period} />
                <SpecRow label="Status" value={project.status} />
              </div>

              {related.length > 0 && (
                <div className="border-t border-line bg-bg-elevated px-4 py-4">
                  <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                    Related exhibits
                  </p>
                  {related.map((r, i) => (
                    <Link
                      key={r.id}
                      href={`/case-files/${r.slug}`}
                      className="mb-2 block w-fit font-display text-[15px] text-ink underline decoration-line-strong underline-offset-4 transition-colors last:mb-0 hover:text-accent-2 hover:decoration-accent-2"
                    >
                      Exhibit {relatedLabels[i]} — {r.name}
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Footer nav */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t-4 border-ink pt-5">
            <Link
              href="/#work"
              scroll={false}
              className="inline-flex items-center gap-2.5 border-2 border-ink px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-bg"
            >
              ← Back to the evidence
            </Link>
            {project.href && (
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 border-2 border-ink bg-ink px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-bg transition-colors hover:bg-transparent hover:text-ink"
              >
                Inspect the evidence — visit the project →
              </a>
            )}
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
