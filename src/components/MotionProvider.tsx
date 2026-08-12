"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "framer-motion";

/**
 * Wraps the app in a single MotionConfig so every whileInView / animate
 * prop across the site (Hero, Work, Stack, Timeline, Contact, IntroScreen)
 * automatically respects prefers-reduced-motion, without editing each
 * component individually.
 *
 * `reducedMotion="user"` defers to the OS-level setting: Framer Motion
 * detects it internally and neutralizes transform-based animation (the
 * y/x slide-ins, the infinite scroll-cue bounce, etc.) for users who have
 * it turned on, while leaving opacity fades intact.
 *
 * This is a separate client component (rather than adding "use client" to
 * layout.tsx) because layout.tsx exports `metadata`, which requires a
 * Server Component.
 *
 * `LayoutGroup` + `AnimatePresence` (keyed on the pathname) live here too,
 * on purpose: this component is rendered by the root layout, which Next
 * never remounts on navigation, so the group survives route changes. That
 * lets the shared `layoutId` on an exhibit's photo (Work.tsx's thumbnail
 * and CaseFile.tsx's hero image) morph into each other across the
 * `/` <-> `/case-files/[slug]` navigation instead of just swapping — in
 * both directions, including "Back to the evidence". `mode="popLayout"`
 * pulls the exiting page out of flow immediately so the incoming page can
 * lay out in its final position right away, which is what lets the photo's
 * FLIP animation target the right end position instead of a stale one.
 */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </LayoutGroup>
    </MotionConfig>
  );
}
