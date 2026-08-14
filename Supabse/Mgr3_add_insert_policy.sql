-- Run this in the Supabase SQL editor. Adds to the table you already
-- created — you don't need to re-run daily_log.sql, just this.
--
-- Lets the site's anon key auto-create missing days (skipped days, or the
-- current day if it doesn't exist yet) when the page loads. Restricted so
-- it can only insert today-or-earlier dates with every habit still false —
-- it can never mark anything as done, only create the empty placeholder.

create policy "Public can insert unlogged past/today rows"
  on public.daily_log
  for insert
  to anon
  with check (
    log_date <= current_date
    and web_dev = false
    and leetcode_potd = false
    and gfg_potd = false
    and dbms = false
    and ml_learning = false
  );
