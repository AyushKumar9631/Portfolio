-- Run this in the Supabase SQL editor for your project.

create table if not exists public.daily_log (
  log_date      date primary key,
  web_dev       boolean not null default false,
  leetcode_potd boolean not null default false,
  gfg_potd      boolean not null default false,
  dbms          boolean not null default false,
  ml_learning   boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table public.daily_log enable row level security;

-- The site reads this table with the public anon key, so allow read-only
-- access. There is deliberately no insert/update/delete policy for `anon` —
-- edit rows yourself from the Supabase Table Editor (or the SQL editor)
-- rather than exposing writes to anyone visiting the site.
create policy "Public can read daily log"
  on public.daily_log
  for select
  to anon
  using (true);

-- Optional: seed the last 31 days (today included) so the table has
-- something to show immediately. Everything starts false — flip values to
-- true as you actually log the day, either here or in the Table Editor.
insert into public.daily_log (log_date)
select generate_series(
  current_date - interval '30 days',
  current_date,
  interval '1 day'
)::date
on conflict (log_date) do nothing;
