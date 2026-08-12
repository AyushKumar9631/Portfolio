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
 * `LayoutGroup` + `AnimatePresence` (keyed on the pathname) both live here,
 * rendered by the root layout, which Next never remounts on navigation —
 * so the group persists across route changes. This isn't optional
 * decoration: a shared `layoutId` can only crossfade/morph between two
 * components if Framer Motion sees both of them mounted at once. Without
 * AnimatePresence, Next swaps the route tree in one shot — the old page
 * (with the thumbnail's layoutId) is gone from the DOM before the new page
 * (with the hero's layoutId) ever appears, so there's nothing to
 * interpolate between and the photo just snaps instead of morphing.
 * AnimatePresence defers that removal until the exit animation finishes,
 * which is what gives the morph a window to run — in both directions,
 * including "Back to the evidence".
 *
 * `mode="popLayout"` pulls the exiting page out of layout flow immediately
 * so the incoming page can lay out in its final position right away,
 * which is what lets the photo's FLIP animation target the right end
 * position instead of a stale one. The wrapper's own opacity fade is kept
 * deliberately subtle (no y-offset) so it doesn't read as a "roll" and
 * compete with the photo — the shared photo morph should be the only
 * thing that visibly moves.
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
