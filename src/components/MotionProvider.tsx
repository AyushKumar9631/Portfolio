"use client";

import { MotionConfig } from "framer-motion";

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
 */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
