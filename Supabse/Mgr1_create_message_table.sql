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