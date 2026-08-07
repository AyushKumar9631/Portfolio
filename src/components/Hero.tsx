"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { profile } from "@/lib/data";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function Hero() {
  return (
    <section
      id="hero"
      className="blueprint-grid relative flex min-h-screen flex-col items-center justify-center px-6 pt-16 text-center"
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-2xl"
      >
        <motion.span
          variants={item}
          className="mb-6 inline-flex items-center gap-2 border border-line-strong px-3 py-1 font-mono text-xs tracking-widest text-accent-2"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent-2" />
          {profile.availability.toUpperCase()}
        </motion.span>

        <motion.h1
          variants={item}
          className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl md:text-6xl"
        >
          {profile.name}
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-3 font-mono text-sm tracking-widest text-accent sm:text-base"
        >
          {profile.role.toUpperCase()} — {profile.location.toUpperCase()}
        </motion.p>

        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-lg text-base text-muted sm:text-lg"
        >
          {profile.tagline}
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#work"
            className="border border-accent bg-accent px-6 py-3 font-mono text-xs tracking-widest text-bg transition-colors hover:bg-transparent hover:text-accent"
          >
            VIEW WORK
          </a>
          <a
            href="#contact"
            className="border border-line-strong px-6 py-3 font-mono text-xs tracking-widest text-ink transition-colors hover:border-accent-2 hover:text-accent-2"
          >
            CONTACT
          </a>
        </motion.div>
      </motion.div>

      <motion.a
        href="#work"
        aria-label="Scroll to work section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 flex flex-col items-center gap-2 font-mono text-[10px] tracking-widest text-muted"
      >
        SCROLL
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          <ArrowDown size={14} />
        </motion.span>
      </motion.a>
    </section>
  );
}
