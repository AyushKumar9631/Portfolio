# Portfolio

A personal portfolio site built with Next.js and Supabase: an intro
animation, scroll-reveal sections for work/skills/timeline, and a contact
form that writes to a Supabase table.

**Stack:** Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · Framer
Motion · Supabase (contact form storage)

## Running it locally

**Requirements:** Node.js 20+ and npm.

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   Copy the example file:

   ```bash
   cp .env.local.example .env.local
   ```

   Then fill in your own Supabase project values in `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```

   You'll find both under **Project Settings → API** in your Supabase
   dashboard. `.env.local` is git-ignored, so your keys won't be committed.

   If you skip this step, the site still runs fine — the contact form
   detects the missing config and shows a "not connected yet" message
   instead of crashing.

3. **Set up the Supabase table**

   In your Supabase project's SQL editor, run:

   ```sql
   create table messages (
     id uuid primary key default gen_random_uuid(),
     created_at timestamptz not null default now(),
     name text not null,
     email text not null,
     message text not null
   );

   alter table messages enable row level security;

   create policy "Allow public inserts"
     on messages for insert
     to anon
     with check (true);
   ```

   This lets the public anon key insert rows but not read, update, or
   delete them — intentional, since the anon key ships in client-side JS.

4. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

5. **Add your own content**

   All placeholder copy — name, role, tagline, projects, skills, timeline —
   lives in one file: `src/lib/data.ts`. Edit the values there; no need to
   touch any component. The visual theme (colors, fonts) lives in
   `src/app/globals.css` under `:root` if you want to retheme.

## Building for production

```bash
npm run build
npm start
```

`npm run build` fetches Lora and Inter from Google Fonts at build time, so
it needs normal internet access (this fails inside network-restricted
sandboxes that block `fonts.googleapis.com` — not an issue on a real
machine or a CI/deploy provider).

## Deploying

- **Frontend:** deploy to [Vercel](https://vercel.com) — connect the repo
  and add the two `NEXT_PUBLIC_SUPABASE_*` environment variables from step 2
  above in the Vercel project settings. No build configuration needed
  beyond that; Vercel auto-detects Next.js.
- **Backend:** nothing separate to deploy. Supabase already hosts the
  `messages` table and handles the database — the contact form talks to it
  directly from the browser using the public anon key, which is safe
  because of the insert-only row-level-security policy set up above.

## Project structure

```
src/
├── app/
│   ├── globals.css       theme tokens, motifs, reduced-motion base rule
│   ├── layout.tsx         fonts, metadata, wraps the app in MotionProvider
│   └── page.tsx            composes all sections in order
├── components/
│   ├── IntroScreen.tsx    hover-reveal intro / boot screen
│   ├── Nav.tsx            fixed header + mobile menu
│   ├── Hero.tsx           name, role, tagline, CTAs
│   ├── Work.tsx           project grid
│   ├── Stack.tsx          skills readout
│   ├── Timeline.tsx       career timeline
│   ├── Contact.tsx        contact form + Supabase insert
│   ├── Footer.tsx         socials + copyright
│   └── MotionProvider.tsx wraps the app so Framer Motion respects
│                          prefers-reduced-motion
└── lib/
    ├── data.ts             all editable content — start here
    ├── words.ts             word list used for the intro screen's texture
    └── supabaseClient.ts    Supabase client, safely null if env vars unset
```
