-- Supabase Notes schema (sections + pages) with permissive RLS for quick start
-- Run this in Supabase SQL Editor. Adjust policies before using in multi-user environments.

-- Extensions (gen_random_uuid)
create extension if not exists pgcrypto;

-- Table: notes_sections
create table if not exists public.notes_sections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Table: notes_pages
create table if not exists public.notes_pages (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.notes_sections(id) on delete cascade,
  title text not null default 'Notă nouă',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Update updated_at on changes
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers
create or replace trigger trg_notes_sections_updated
before update on public.notes_sections
for each row execute function public.set_updated_at();

create or replace trigger trg_notes_pages_updated
before update on public.notes_pages
for each row execute function public.set_updated_at();

-- Helpful indexes
create index if not exists idx_notes_sections_project on public.notes_sections(project_id);
create index if not exists idx_notes_pages_section on public.notes_pages(section_id);
create index if not exists idx_notes_pages_updated_at on public.notes_pages(updated_at desc);

-- Enable RLS
alter table public.notes_sections enable row level security;
alter table public.notes_pages enable row level security;

-- Permissive policies (for personal usage / anon key). WARNING: Open access!
-- Consider tightening to authenticated users or adding user ownership columns.
drop policy if exists notes_sections_all on public.notes_sections;
create policy notes_sections_all on public.notes_sections
  for all
  using (true)
  with check (true);

drop policy if exists notes_pages_all on public.notes_pages;
create policy notes_pages_all on public.notes_pages
  for all
  using (true)
  with check (true);

-- Realtime will work automatically for these tables in Supabase.
-- If you later restrict policies, make sure your client role has permissions to SELECT/INSERT/UPDATE/DELETE as needed.
