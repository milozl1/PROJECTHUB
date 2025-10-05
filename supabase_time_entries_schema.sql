-- Supabase schema for time_entries (Time Tracking + Pomodoro)
-- Safe to run multiple times; objects are created if missing.

-- Extensions
create extension if not exists pgcrypto;

-- Table
create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  -- Ownership for RLS (recommended)
  owner_id uuid,
  user_id uuid,
  task_id uuid,
  project_id uuid,
  hours numeric(6,2) not null check (hours > 0),
  date date not null default current_date,
  description text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

create or replace trigger trg_time_entries_updated
before update on public.time_entries
for each row execute function public.set_updated_at();

-- Indexes
create index if not exists idx_time_entries_owner on public.time_entries(owner_id);
create index if not exists idx_time_entries_user on public.time_entries(user_id);
create index if not exists idx_time_entries_task on public.time_entries(task_id);
create index if not exists idx_time_entries_project on public.time_entries(project_id);
create index if not exists idx_time_entries_date on public.time_entries(date desc);

-- RLS
alter table public.time_entries enable row level security;

-- Development (personal) policy - permissive
-- NOTE: Replace with hardened policies before multi-user use
drop policy if exists time_entries_all on public.time_entries;
create policy time_entries_all on public.time_entries for all using (true) with check (true);

-- Hardened (multi-user) policies — uncomment to enable and remove the permissive one
-- drop policy if exists time_entries_all on public.time_entries;
-- drop policy if exists time_entries_select_own on public.time_entries;
-- drop policy if exists time_entries_write_own on public.time_entries;
-- drop policy if exists time_entries_update_own on public.time_entries;
-- create policy time_entries_select_own on public.time_entries for select to authenticated using (owner_id = auth.uid());
-- create policy time_entries_write_own on public.time_entries for insert to authenticated with check (owner_id = auth.uid());
-- create policy time_entries_update_own on public.time_entries for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
