"use client";

import { LayoutGroup, MotionConfig } from "framer-motion";

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
 * `LayoutGroup` lives here (rendered by the root layout, which Next never
 * remounts on navigation) so it persists across route changes. That's
 * what lets the shared `layoutId` on an exhibit's photo (Work.tsx's
 * thumbnail and CaseFile.tsx's hero image) morph into each other across
 * the `/` <-> `/case-files/[slug]` navigation instead of just swapping —
 * in both directions, including "Back to the evidence". No page-level
 * transition wrapper here on purpose: Framer Motion picks up the shared
 * layoutId and animates it on its own the moment Next swaps the route's
 * page tree, so the rest of the page just swaps instantly and only the
 * photo itself visibly moves.
 */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup>{children}</LayoutGroup>
    </MotionConfig>
  );
}
