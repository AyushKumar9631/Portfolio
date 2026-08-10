"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Phone } from "lucide-react";
import { projects } from "@/lib/data";

/** "+918035016969" -> "+91 80350 16969" (Indian mobile grouping). Falls back
 *  to the raw string for any number that isn't a 10-digit +91 number. */
function formatIndianPhone(phone: string) {
  const match = phone.match(/^\+91(\d{5})(\d{5})$/);
  return match ? `+91 ${match[1]} ${match[2]}` : phone;
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function Work() {
  return (
    <section id="work" className="bg-bg-elevated px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="mb-12 flex flex-wrap items-end justify-between gap-4 border-b border-line-strong pb-4"
        >
          <div>
            <span className="font-mono text-xs tracking-widest text-accent-2">
              SELECTED WORK
            </span>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
              Projects
            </h2>
          </div>
          <span className="font-mono text-xs tracking-widest text-muted">
            {String(projects.length).padStart(2, "0")} ENTRIES
          </span>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {projects.map((project) => {
            const hasLink = Boolean(project.href) && project.href !== "#";

            return (
              <motion.div
                key={project.id}
                variants={item}
                className="corner-brackets group relative flex flex-col border border-line bg-bg p-6 transition-colors hover:border-accent-2"
              >
                {hasLink && (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10"
                    aria-label={`View ${project.name} (opens in new tab)`}
                  />
                )}

                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono text-xs tracking-widest text-muted">
                    {project.id}
                  </span>
                  <span className="border border-line-strong px-2 py-0.5 font-mono text-[10px] tracking-widest text-accent-2">
                    {project.tag.toUpperCase()}
                  </span>
                </div>

                <h3 className="mt-4 flex items-center gap-1 font-display text-xl font-semibold text-ink">
                  {project.name}
                  {hasLink && (
                    <ArrowUpRight
                      size={16}
                      className="-translate-y-0.5 text-accent opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  )}
                </h3>
                <p className="mt-1 font-mono text-[11px] tracking-widest text-muted">
                  {project.org.toUpperCase()} — {project.period.toUpperCase()}
                </p>

                <p className="mt-4 flex-1 text-sm text-muted">
                  {project.summary}
                </p>

                {project.phone && (
                  <a
                    href={`tel:${project.phone}`}
                    className="relative z-20 mt-4 inline-flex w-fit items-center gap-2 self-start border border-accent px-3 py-1.5 font-mono text-xs tracking-wide text-accent transition-colors hover:bg-accent hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                  >
                    <Phone size={14} aria-hidden="true" />
                    Call the agent: {formatIndianPhone(project.phone)}
                  </a>
                )}

                <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-4">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="border border-line px-2 py-1 font-mono text-[10px] tracking-widest text-ink"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
