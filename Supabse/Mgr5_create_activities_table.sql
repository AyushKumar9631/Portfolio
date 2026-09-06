-- Run this in the Supabase SQL editor for your project.
-- Powers the new "Activity Log" section, replacing the old Daily Docket
-- (daily_log table). This does NOT drop daily_log — drop it yourself later
-- if you're sure you don't need it (e.g. `drop table public.daily_log;`).

create table if not exists public.activities (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null,
  description   text not null,
  duration      text not null,
  -- Drives sort order ("recent activities"). Free text `duration` above is
  -- just for display (e.g. "3 days", "Jun — Aug 2026"); this date is what
  -- the feed is actually ordered by, newest first.
  activity_date date not null default current_date,
  github_link   text,
  demo_link     text,
  -- Freeform tags for "other common info" — tech used, category, etc.
  tags          text[] not null default '{}'
);

alter table public.activities enable row level security;

-- The site reads this table with the public anon key.
create policy "Public can read activities"
  on public.activities
  for select
  to anon
  using (true);

-- Deliberately no insert/update/delete policy for `anon`. All writes go
-- through the /api/admin/activities routes, which use the service-role key
-- and are gated by the same admin_session cookie as the rest of the admin
-- tools (see ADMIN_SESSION_SECRET in env.local.example) — so RLS being
-- otherwise locked down doesn't block the admin UI, it just blocks anyone
-- without that cookie.
