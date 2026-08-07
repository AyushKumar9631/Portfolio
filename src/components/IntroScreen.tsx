"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type IntroScreenProps = {
  onComplete?: () => void;
};

const bootLines = [
  "$ init portfolio.build",
  "$ loading profile ......... ok",
  "$ indexing projects ....... ok",
  "$ compiling stack.json .... ok",
  "$ ready",
];

const AUTO_DISMISS_MS = 2600;
const EXIT_DURATION_MS = 500;

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (visible) return;
    const timer = setTimeout(() => onComplete?.(), EXIT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [visible, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          role="status"
          aria-label="Loading site"
          className="blueprint-grid fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg px-6"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: EXIT_DURATION_MS / 1000, ease: "easeInOut" }}
        >
          <div className="space-y-2 font-mono text-sm text-muted sm:text-base">
            {bootLines.map((line, i) => (
              <motion.p
                key={line}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 * i, duration: 0.3 }}
                className={i === bootLines.length - 1 ? "text-accent-2" : undefined}
              >
                {line}
              </motion.p>
            ))}
          </div>

          <motion.button
            type="button"
            onClick={() => setVisible(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 * bootLines.length + 0.2 }}
            className="mt-10 border border-line-strong px-4 py-2 font-mono text-xs tracking-widest text-muted transition-colors hover:border-accent-2 hover:text-ink"
          >
            SKIP &rarr;
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
