# Database Maintenance & Supabase Guide

This document describes recommended practices to run ProjectHub with a cloud database (Supabase / Postgres), including schema guidance, RLS policies, backups, indexing, and a migration playbook. It complements `supabase_notes_schema.sql` and adds an optional `time_entries` schema to support Time Tracking (including Pomodoro) in the cloud.

## 1) Scope & environments

- Local (default): LocalStorage via DataStore — no DB maintenance needed.
- Cloud (optional): Supabase/Postgres
  - Notes schema already provided (sections/pages).
  - You can add more tables (projects, tasks, users, time_entries) progressively.
  - Recommended environments: `dev`, `staging`, `prod`, with database password rotated and a service role key stored only in secure backends/CI.

## 2) Baseline: Notes schema (already provided)

See `supabase_notes_schema.sql`. It contains:
- Tables: `public.notes_sections`, `public.notes_pages`
- Trigger to maintain `updated_at`
- Indexes for project/section IDs and `updated_at`
- RLS enabled with permissive policies (suited for personal/single-user testing; tighten before multi-user.)

## 3) Optional: Time entries in Supabase

If you want Time Tracking (including Pomodoro focus sessions) to persist in Supabase, create the table `public.time_entries` and wire your adapter to write to it.

See `supabase_time_entries_schema.sql` for a production-ready starter that includes:
- Table `public.time_entries` with uuid PK and essential columns: `owner_id`, `user_id`, `task_id` (optional), `project_id` (optional), `hours` (numeric), `date`, `description`, timestamps.
- Trigger for `updated_at`.
- Useful indexes (owner, user, task, project, date).
- RLS enabled. Two policy modes are provided:
  - Permissive (personal sandbox): allow all.
  - Hardened (multi-user): authenticated-only; owners can read/write their own rows; optional project-level access.

## 4) RLS hardening patterns

When moving beyond personal usage, switch from permissive to hardened policies:

- Add an ownership column (e.g., `owner_id uuid NOT NULL` referencing your users table or auth subject).
- Use `auth.uid()` in policies to limit access to owners.
- Example read policy:
  ```sql
  create policy "time_entries_select_own"
    on public.time_entries for select
    to authenticated
    using (owner_id = auth.uid());
  ```
- Example write policy:
  ```sql
  create policy "time_entries_write_own"
    on public.time_entries for insert with check (owner_id = auth.uid())
    to authenticated;
  create policy "time_entries_update_own"
    on public.time_entries for update using (owner_id = auth.uid()) with check (owner_id = auth.uid())
    to authenticated;
  ```
- If you need project-shared access, introduce a membership table (e.g., `project_members(project_id, user_id, role)`) and reference that in `using` and `with check` clauses.

## 5) Migrations playbook

- Prefer idempotent scripts when possible. Structure changes as numbered migrations (e.g., `/supabase/migrations/2025-10-04-001_time_entries.sql`).
- Migration pipeline:
  1. Dev: run migration and smoke test.
  2. Staging: run migration; enable RLS tests; backfill data.
  3. Prod: take a snapshot/backup (see backups), then apply migration during a low-traffic window.
- Avoid destructive changes in-place. Instead:
  - Create new columns/tables.
  - Backfill.
  - Swap usage in app.
  - Drop old artifacts in a later maintenance window.

## 6) Backups & restore

- Supabase offers Point-In-Time Recovery on paid plans; otherwise schedule logical backups.
- Minimum: a nightly `pg_dump` of public schema and data to object storage.
- Keep at least 7–30 days of backups, depending on compliance.
- Test restores periodically in a staging environment.

## 7) Indexing strategy

- Foreign keys and filter columns: add btree indexes (e.g., `owner_id`, `user_id`, `task_id`, `project_id`).
- Time-series filtering: index `date` and `updated_at`.
- Full-text search (optional): GIN index over `to_tsvector('simple', title || ' ' || content)` for notes.
- Monitor slow queries and add targeted indexes; avoid over-indexing writes-heavy tables.

## 8) Vacuum, analyze, and autovacuum

- Rely on Postgres autovacuum; for heavy-write tables, consider tuning thresholds.
- Periodic `ANALYZE` after bulk loads/migrations for optimal planner stats.

## 9) Data lifecycle & retention

- Time entries: consider retention or aggregation beyond N months (e.g., archive old entries).
- Notes: keep `updated_at` only; add soft-delete (`deleted_at`) if needed.
- GDPR requests: a simple `deleted_at` soft delete column helps you hide data quickly while planning hard deletes.

## 10) Observability & operations

- Enable query logs and slow query thresholds.
- Track row counts per table and index bloat.
- Set up alerts for storage nearing limits and error spikes.

## 11) Example: time_entries migration (excerpt)

```sql
-- See supabase_time_entries_schema.sql for the full script
create extension if not exists pgcrypto;

create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  -- Ownership for RLS (recommended for multi-user)
  owner_id uuid,
  user_id uuid,
  task_id uuid,
  project_id uuid,
  minutes integer not null check (minutes > 0),
  date date not null default current_date,
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

create or replace trigger trg_time_entries_updated
before update on public.time_entries
for each row execute function public.set_updated_at();

create index if not exists idx_time_entries_owner on public.time_entries(owner_id);
create index if not exists idx_time_entries_user on public.time_entries(user_id);
create index if not exists idx_time_entries_task on public.time_entries(task_id);
create index if not exists idx_time_entries_project on public.time_entries(project_id);
create index if not exists idx_time_entries_date on public.time_entries(date desc);

alter table public.time_entries enable row level security;
-- Development (personal): permissive
drop policy if exists time_entries_all on public.time_entries;
create policy time_entries_all on public.time_entries for all using (true) with check (true);

-- Hardened (multi-user):
-- drop policy if exists time_entries_all on public.time_entries;
-- drop policy if exists time_entries_select_own on public.time_entries;
-- drop policy if exists time_entries_write_own on public.time_entries;
-- drop policy if exists time_entries_update_own on public.time_entries;
-- create policy time_entries_select_own on public.time_entries for select to authenticated using (owner_id = auth.uid());
-- create policy time_entries_write_own on public.time_entries for insert to authenticated with check (owner_id = auth.uid());
-- create policy time_entries_update_own on public.time_entries for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
```

## 12) App wiring for time_entries (high-level)

- In `SupabaseStore`, add CRUD methods:
  - `addTimeEntry({ ownerId, userId, taskId, projectId, minutes, date, notes })`
  - `listTimeEntries({ userId?, projectId?, from?, to? })`
  - (optional) `deleteTimeEntry(id)` / `updateTimeEntry(id, patch)`
- In `app.js`, replace local pushes to `this.data.timeEntries` with calls to the store in cloud mode; keep `DataStore.save()` fallback for local.
- Pomodoro hook: when a focus phase completes, convert minutes = configured focus minutes and call `addTimeEntry`.

## 13) Checklist before going multi-user

- [ ] Switch permissive policies to hardened policies.
- [ ] Add `owner_id` and backfill existing rows with the primary account.
- [ ] Ensure JWTs contain the correct user identifier for `auth.uid()`.
- [ ] Create project membership model if sharing across users is needed.
- [ ] Enable backups and test a restore.
- [ ] Monitor slow queries after first weeks of usage and add indexes accordingly.

---

For help implementing the Supabase adapter for time entries, or designing project/task/user schemas with proper RLS, open an issue in docs or ask for a module-by-module adapter spec.