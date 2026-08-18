"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Briefcase } from "lucide-react";
import { profile } from "@/lib/data";
import HireMeModal from "@/components/HireMeModal";

const links = [
  { href: "#work", label: "Work" },
  { href: "#stack", label: "Stack" },
  { href: "#timeline", label: "Timeline" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [hireMeOpen, setHireMeOpen] = useState(false);

  // Tracks whichever section currently owns the middle of the viewport
  // and highlights the matching nav link. The -45%/-45% rootMargin
  // shrinks the observed area to a thin band around vertical center, so
  // the active link switches right as a section crosses the middle of
  // the screen rather than the moment it merely enters the viewport.
  useEffect(() => {
    const sections = links
      .map((link) => document.querySelector(link.href))
      .filter((el): el is Element => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(`#${entry.target.id}`);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b-2 border-black bg-bg/80 backdrop-blur-sm">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a
            href="#top"
            className="font-mono text-sm tracking-widest text-ink"
            onClick={() => setOpen(false)}
          >
            {profile.name.toUpperCase()}
          </a>

          <div className="hidden items-center gap-8 sm:flex">
            <ul className="flex items-center gap-8 font-mono text-xs tracking-widest text-muted">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`underline-offset-[6px] transition-colors hover:text-accent-2 ${
                      activeId === link.href
                        ? "text-ink underline decoration-2"
                        : ""
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setHireMeOpen(true)}
              className="inline-flex items-center gap-2 border-2 border-ink bg-ink px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.1em] text-bg transition-colors hover:bg-transparent hover:text-ink"
            >
              <Briefcase size={14} aria-hidden="true" />
              Hire Me
            </button>
          </div>

          <button
            type="button"
            className="text-ink sm:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-t border-line bg-bg font-mono text-sm tracking-widest text-muted sm:hidden"
            >
              {links.map((link) => (
                <li key={link.href} className="border-b border-line">
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block px-6 py-4 underline-offset-4 transition-colors hover:text-accent-2 ${
                      activeId === link.href
                        ? "text-ink underline decoration-2"
                        : ""
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setHireMeOpen(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 bg-ink px-6 py-4 font-mono text-sm font-bold uppercase tracking-widest text-bg transition-colors hover:text-accent-2"
                >
                  <Briefcase size={14} aria-hidden="true" />
                  Hire Me
                </button>
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </header>

      <HireMeModal open={hireMeOpen} onClose={() => setHireMeOpen(false)} />
    </>
  );
}
