"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { projects, type Project } from "@/lib/data";

const EXHIBIT_LETTERS = ["A", "B", "C", "D", "E", "F", "G"];

/** "+918035016969" -> "+91 80350 16969" (Indian mobile grouping). Falls back
 *  to the raw string for any number that isn't a 10-digit +91 number. */
function formatIndianPhone(phone: string) {
  const match = phone.match(/^\+91(\d{5})(\d{5})$/);
  return match ? `+91 ${match[1]} ${match[2]}` : phone;
}

function hostFromUrl(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const staggerGrid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

/** Hand-drawn circle behind the "Exhibit X" tag, in the caption bar under
 * each thumbnail. Draws itself in once when scrolled into view. */
function SketchCircle() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 44"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -bottom-1.5 -left-2 -right-3 -top-1.5 h-[calc(100%+12px)] w-[calc(100%+20px)]"
    >
      <motion.path
        d="M10 24 C 8 10, 44 4, 76 7 C 104 10, 116 18, 112 28 C 108 38, 70 42, 40 39 C 16 37, 8 30, 12 20"
        fill="none"
        stroke="var(--accent-2)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.85"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
      />
    </svg>
  );
}

/** The "taped photograph" thumbnail: real screenshots aren't wired up yet,
 * so this renders as a labeled placeholder frame instead of an <img>. Swap
 * in next/image once real screenshots exist — the frame markup stays. */
function ThumbnailFrame({
  exhibitLabel,
  caption,
  captionHref,
  heightClass,
  stampLabel,
  screenshot,
  alt,
}: {
  exhibitLabel: string;
  caption: string;
  captionHref?: string;
  heightClass: string;
  stampLabel: string;
  screenshot?: string;
  alt: string;
}) {
  return (
    <div className="relative border border-ink/25 bg-bg p-2 pb-0 shadow-[0_2px_14px_rgba(22,20,15,0.14)]">
      <span
        aria-hidden="true"
        className="absolute -top-2 left-1/2 z-[1] h-4 w-16 -translate-x-1/2 -rotate-2 border border-ink/10 bg-bg-elevated/75"
      />
      <div
        className={`relative overflow-hidden border border-ink/40 bg-bg-elevated/50 ${heightClass} flex items-center justify-center`}
      >
        {screenshot ? (
          <Image
            src={screenshot}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 540px"
            className="object-cover object-top grayscale contrast-[1.04] mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted/70">
            Screenshot pending
          </span>
        )}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(rgba(138,109,59,0.5) 0.7px, transparent 0.8px)",
            backgroundSize: "4px 4px",
            mixBlendMode: "multiply",
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 top-2.5 rotate-[8deg] scale-150 border-[3px] border-accent-2 bg-bg/85 px-2.5 py-1 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-accent-2 opacity-0 transition-all duration-200 ease-out group-hover:-rotate-[8deg] group-hover:scale-100 group-hover:opacity-100"
        >
          {stampLabel}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 px-1 py-1.5 font-mono text-[11px] tracking-[0.02em] text-muted">
        <span className="relative shrink-0 font-bold uppercase text-ink">
          {exhibitLabel}
          <SketchCircle />
        </span>
        {captionHref ? (
          <a
            href={captionHref}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-20 truncate underline-offset-2 hover:underline"
          >
            {caption}
          </a>
        ) : (
          <span className="truncate">{caption}</span>
        )}
      </div>
    </div>
  );
}

function TagPills({ stack }: { stack: string[] }) {
  return (
    <div className="mb-4 mt-[18px] flex flex-wrap gap-1.5">
      {stack.map((tech) => (
        <span
          key={tech}
          className="inline-flex items-center gap-1.5 border border-ink px-2.5 py-[3px] font-mono text-[11px] font-medium text-ink"
        >
          {tech}
        </span>
      ))}
    </div>
  );
}

/** "Open case file" -> deep-dive page for this project, at
 * /case-files/[slug] (see src/app/case-files/[slug]/page.tsx). */
function CaseFileButton({ label, slug }: { label: string; slug: string }) {
  return (
    <Link
      href={`/case-files/${slug}`}
      className="group/link relative z-20 inline-flex items-center gap-1.5 border-b-[1.5px] border-accent-2 pb-0.5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-accent-2 transition-colors hover:text-ink hover:border-ink"
    >
      {label}
      <span className="transition-transform duration-150 group-hover/link:translate-x-1">
        →
      </span>
    </Link>
  );
}

function FeaturedExhibit({ project }: { project: Project }) {
  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className="group relative flex flex-col items-stretch gap-8 border-b border-ink/25 py-7 transition-colors hover:bg-bg-elevated/40 lg:flex-row"
    >
      <div className="w-full self-start lg:w-[46%] lg:flex-none">
        <ThumbnailFrame
          exhibitLabel="Exhibit A"
          caption={project.href ? `recovered from ${hostFromUrl(project.href)}` : `recovered from ${project.org}`}
          captionHref={project.href}
          heightClass="aspect-video lg:aspect-auto lg:h-[272px]"
          stampLabel={project.kind === "internship" ? "Internship" : "Personal"}
          screenshot={project.screenshot}
          alt={project.name}
        />
      </div>

      <div className="flex flex-1 flex-col">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-accent-2">
          Exhibit A
        </span>
        <span className="mt-3 font-mono text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink">
          {project.name} · {project.tag}
        </span>
        <h3 className="mt-2 font-display text-[clamp(30px,3.6vw,46px)] font-normal leading-[1.06] tracking-[-0.01em] text-ink">
          {project.name}
        </h3>
        <p className="mt-3.5 mb-auto max-w-[60ch] font-display text-[17px] leading-[1.55] text-muted [hyphens:auto] [text-align:justify]">
          {project.summary}
        </p>

        <TagPills stack={project.stack} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/25 pt-3.5">
          <span className="font-mono text-xs text-muted">
            {project.period} · {project.org}
          </span>
          <div className="flex items-center gap-4">
            {project.phone && (
              <a
                href={`tel:${project.phone}`}
                className="relative z-20 inline-flex items-center gap-2 border border-accent px-3 py-1.5 font-mono text-xs tracking-wide text-accent transition-colors hover:bg-accent hover:text-bg"
              >
                <Phone size={14} aria-hidden="true" />
                Call: {formatIndianPhone(project.phone)}
              </a>
            )}
            <CaseFileButton label="Open case file" slug={project.slug} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function GridExhibit({ project, letter }: { project: Project; letter: string }) {
  return (
    <motion.article
      variants={fadeUp}
      className="group relative flex flex-col border-t border-ink/25 py-[26px] pl-4 pr-0 transition-colors hover:bg-bg-elevated/40 sm:border-r sm:border-ink/25 sm:pr-[26px] sm:[&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:pr-0 lg:border-r lg:border-ink/25 lg:pr-[26px] lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(2n)]:pr-[26px] lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n)]:pr-0"
    >
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-accent-2">
        Exhibit {letter}
      </span>
      <span className="mt-3 font-mono text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink">
        {project.org}
      </span>
      <h3 className="mt-2 min-h-[calc(2*28px*1.06)] font-display text-[28px] font-normal leading-[1.06] tracking-[-0.01em] text-ink">
        {project.name}
      </h3>

      <div className="mt-4">
        <ThumbnailFrame
          exhibitLabel={`Exhibit ${letter}`}
          caption={project.href ? `recovered from ${hostFromUrl(project.href)}` : `recovered from ${project.org}`}
          captionHref={project.href}
          heightClass="h-[176px]"
          stampLabel={project.kind === "internship" ? "Internship" : "Personal"}
          screenshot={project.screenshot}
          alt={project.name}
        />
      </div>

      <p className="mt-3.5 mb-auto font-display text-[15px] leading-[1.55] text-muted [hyphens:auto] [text-align:justify]">
        {project.summary}
      </p>

      <TagPills stack={project.stack} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/25 pt-3.5">
        <span className="font-mono text-xs text-muted">{project.period}</span>
        <div className="flex items-center gap-4">
          {project.phone && (
            <a
              href={`tel:${project.phone}`}
              className="relative z-20 inline-flex items-center gap-2 border border-accent px-2.5 py-1 font-mono text-[11px] tracking-wide text-accent transition-colors hover:bg-accent hover:text-bg"
            >
              <Phone size={12} aria-hidden="true" />
              Call
            </a>
          )}
          <CaseFileButton label="Open case file" slug={project.slug} />
        </div>
      </div>
    </motion.article>
  );
}

export default function Work() {
  // Exhibit A is whichever project is internship work; everything else
  // (personal projects) fills out the grid in declared order.
  const featured = projects.find((p) => p.kind === "internship") ?? projects[0];
  const rest = projects.filter((p) => p !== featured);
  const lastLetter = EXHIBIT_LETTERS[rest.length] ?? "?";

  return (
    <>
      {/* Full-bleed thick divider between the front page and the work
          section — deliberately outside the max-w container below. */}
      <div className="h-2 w-full bg-ink" aria-hidden="true" />

      <section id="work" className="bg-bg px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-[30px]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-wrap items-baseline justify-between gap-5 pb-2.5"
            >
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-ink">
                  The Evidence
                </span>
                <h2 className="mt-1.5 font-display text-[clamp(30px,4vw,46px)] font-normal leading-[1.02] tracking-[-0.015em] text-ink">
                  Selected Works
                </h2>
              </div>
              <span className="whitespace-nowrap font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Exhibits A – {lastLetter} · Entered 2025 – Now
              </span>
            </motion.div>
            <div className="h-1 bg-ink" />
          </div>

          {featured && <FeaturedExhibit project={featured} />}

          <motion.div
            variants={staggerGrid}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {rest.map((project, i) => (
              <GridExhibit
                key={project.id}
                project={project}
                letter={EXHIBIT_LETTERS[i + 1] ?? "?"}
              />
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
