# Portfolio Site — Build Plan

## How this workflow works

1. Upload this `PLAN.md` + the project zip to a **new chat**.
2. Paste the starter prompt below.
3. Claude unzips, reads `PLAN.md`, does the **next unchecked task only**, then gives you back updated files + an updated `PLAN.md` with that task checked off.
4. Download everything, start a new chat, repeat until all tasks are checked.

### Starter prompt (copy-paste into each new session)

```
I'm continuing a Next.js + Supabase portfolio project across multiple sessions.
Files are attached: PLAN.md and portfolio-progress.zip.
Unzip the project, run `npm install`, read PLAN.md, and complete ONLY the next
unchecked task in the task list. Don't skip ahead or redo finished tasks.
When done: give me the updated/new files, an updated PLAN.md with that task
checked off and its "Session log" filled in, and a fresh zip of the project
(excluding node_modules and .next).
```

---

## Project overview

**Goal:** A personal portfolio site, architecturally inspired by a newspaper/case-file style portfolio the user liked — same *type* of build (intro animation, scroll-reveal sections, project grid, skills readout, timeline, contact form wired to a database) but with **original content and an original visual identity**, not a copy of the reference site's text, images, or exact design.

**Stack:** Next.js 15 (App Router, TypeScript) · Tailwind CSS v4 · Framer Motion · Supabase (contact form storage)

**Design identity — "Build Log / Blueprint"**
- Palette: `--bg #0a0f1c` (near-black navy), `--bg-elevated #101a2e`, `--ink #e7ecf5`, `--muted #7c8aa8`, `--accent #e7a24c` (signal amber), `--accent-2 #5fd0c0` (cyan)
- Fonts: Space Grotesk (display/headings), JetBrains Mono (labels/data/code bits), Inter (body)
- Motifs: faint blueprint grid background (`.blueprint-grid` class already in `globals.css`), corner-bracket frames on cards (`.corner-brackets` class already in `globals.css`), diagnostics-panel styling for the skills section
- All variables live in `src/app/globals.css` under `:root` — change values there to retheme everything at once

**Content:** All placeholder copy lives in `src/lib/data.ts` (profile, projects, stack, timeline). Replace with real info — this is a plain data file, no copy-pasting into components needed.

---

## Current file tree (as of last session)

```
portfolio/
├── src/
│   ├── app/
│   │   ├── globals.css      ✅ theme tokens, blueprint grid, corner brackets, reduced-motion
│   │   ├── layout.tsx       ✅ fonts wired (Space Grotesk / JetBrains Mono / Inter), metadata
│   │   └── page.tsx         ⚠️ still default Next.js starter — needs rebuilding in Task 7
│   └── lib/
│       └── data.ts          ✅ placeholder profile/projects/stack/timeline
├── public/                  default Next.js SVGs, unused, safe to ignore/delete later
├── package.json             ✅ next, react, tailwindcss, framer-motion, @supabase/supabase-js, lucide-react
└── (config files)           ✅ tsconfig, eslint, postcss — untouched defaults, fine as-is
```

---

## Task list

### ✅ Task 0 — Scaffold (DONE)
Next.js + TS + Tailwind app created. Installed `framer-motion`, `@supabase/supabase-js`, `lucide-react`. Theme tokens and fonts wired. Placeholder content file created.

**Session log:** Completed in initial session. No blockers.

---

### ☐ Task 1 — Nav + intro/boot screen
Build `src/components/Nav.tsx` (fixed header, links to each section, mobile menu) and `src/components/IntroScreen.tsx` (full-screen boot sequence on first load — a few lines of "system check" style text animating in with Framer Motion, then a "Skip" button and auto-dismiss after ~2.5s into the main site). Keep it a client component; no external state/storage needed, plain `useState`.

**Acceptance:** Both components render in isolation without errors (temporarily drop them into `page.tsx` to eyeball them). Intro dismisses on click and on timer. Nav links are placeholder `href="#section-id"` anchors matching section ids that will exist after Task 7.

---

### ☐ Task 2 — Hero section
Build `src/components/Hero.tsx`: name/role from `profile` in `data.ts`, tagline, availability badge, two CTA buttons (View Work → `#work`, Contact → `#contact`), blueprint-grid background via the existing `.blueprint-grid` class, subtle scroll-down cue. Scroll/entrance animation via Framer Motion.

**Acceptance:** Renders correctly at mobile (375px) and desktop widths. No layout shift on load.

---

### ☐ Task 3 — Work / projects section
Build `src/components/Work.tsx`: grid of cards from `projects` in `data.ts`, using `.corner-brackets` styling, tag + period + stack badges, scroll-triggered reveal (`whileInView`) staggered per card, hover state.

**Acceptance:** Renders all placeholder projects correctly; adding/removing an entry in `data.ts` doesn't break layout.

---

### ☐ Task 4 — Stack / skills section
Build `src/components/Stack.tsx`: diagnostics-panel style list/table from `stack` in `data.ts` (code, name, detail, status). Status should map to a small visual indicator (e.g. dot color: daily = accent, comfortable = accent-2, learning = muted).

**Acceptance:** Renders correctly with the current 8 stack items; visually distinguishes the three status types.

---

### ☐ Task 5 — Career timeline section
Build `src/components/Timeline.tsx`: vertical line + entries from `timeline` in `data.ts`, scroll-reveal per entry, reverse-chronological order (already ordered that way in the data file).

**Acceptance:** Renders correctly with 3+ entries; works if a 4th is added.

---

### ☐ Task 6 — Contact form + Supabase wiring
Build `src/lib/supabaseClient.ts` (reads `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` from env), `src/components/Contact.tsx` (name/email/message form, client-side validation, submit → insert into a `messages` table, success/error state, no page reload), and `.env.local.example`.

**This task also needs manual action from you outside Claude — the next session should give you these as plain instructions, not do them for you:**
- Create a free Supabase project at supabase.com
- In the SQL editor, create the `messages` table (the session will give you exact SQL)
- Copy your Project URL + anon public key into `.env.local` (never commit this file — confirm it's in `.gitignore`)

**Acceptance:** Form renders, validates empty/invalid input, and (once you've added real Supabase credentials locally) successfully inserts a row.

---

### ☐ Task 7 — Assemble the page + footer
Build `src/components/Footer.tsx` (socials from `profile`, copyright line). Rewrite `src/app/page.tsx` to compose `IntroScreen`, `Nav`, `Hero`, `Work`, `Stack`, `Timeline`, `Contact`, `Footer` in order, with correct section `id`s matching the Nav links from Task 1.

**Acceptance:** Full page renders top to bottom with no console errors; nav links scroll to the right section.

---

### ☐ Task 8 — Responsive + accessibility + build check
Pass over every section at 375px / 768px / 1440px widths. Confirm visible keyboard focus states on all interactive elements (buttons, links, form fields). Confirm `prefers-reduced-motion` is respected (base rule already in `globals.css` — check it's not overridden). Run `npm run build` and fix any TypeScript/ESLint errors.

**Acceptance:** `npm run build` completes with no errors. No obvious layout breakage at the three widths above.

---

### ☐ Task 9 — README + final packaging
Write a `README.md` covering: what the project is, how to run it locally (`npm install`, `.env.local` setup, `npm run dev`), and a short deployment note (Vercel for the Next.js app; Supabase project already hosts the backend/database, no separate server to deploy). Produce a final zip.

**Acceptance:** A person with no prior context could clone this, follow the README, and get it running locally.

---

## Notes for future sessions

- Don't re-theme, rename data fields, or restructure `data.ts` — later tasks depend on its current shape.
- Keep components in `src/components/`, one file per section, default export, no prop drilling needed (each imports from `src/lib/data.ts` directly).
- If a task turns out too big to finish in one session, stop partway, note exactly what's left in that task's **Session log**, and leave the checkbox unchecked — the next session will pick up mid-task rather than skip to the next one.
