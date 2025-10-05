-- Schema cleanup and small optimizations
-- Paste this into Supabase SQL Editor and run once.

BEGIN;

-- Keep the default-named unique constraint; drop the extra unique CONSTRAINT (it owns its index)
ALTER TABLE public.task_dependencies DROP CONSTRAINT IF EXISTS uq_deps_pair;
-- Drop duplicate simple indexes; keep the standard *_task_id_idx ones
DROP INDEX IF EXISTS public.idx_deps_predecessor;
DROP INDEX IF EXISTS public.idx_deps_successor;

-- 2) Remove duplicate index on tasks.search_vector (keep tasks_search_vector_idx)
DROP INDEX IF EXISTS public.tasks_search_idx;

-- 3) Remove duplicate index on subtasks.task_id (keep subtasks_task_id_idx)
DROP INDEX IF EXISTS public.idx_subtasks_task_id;

-- 4) Remove duplicate trigger for tasks search vector (keep trg_tasks_search_vector)
DROP TRIGGER IF EXISTS trg_tasks_search ON public.tasks;

-- 5) Add a composite index to speed up ordering within a project
CREATE INDEX IF NOT EXISTS tasks_project_sort_idx ON public.tasks(project_id, sort_index);

-- 5a) Backfill missing sort_index values per project deterministically
WITH to_fix AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY project_id
           ORDER BY created_at NULLS FIRST, title, id
         ) AS new_index
  FROM public.tasks
  WHERE sort_index IS NULL
)
UPDATE public.tasks t
SET sort_index = f.new_index
FROM to_fix f
WHERE t.id = f.id;

-- 6) Prevent accidental self-dependencies at DB level
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'task_dependencies_no_self'
      AND conrelid = 'public.task_dependencies'::regclass
  ) THEN
    ALTER TABLE public.task_dependencies
      ADD CONSTRAINT task_dependencies_no_self
      CHECK (predecessor_task_id <> successor_task_id);
  END IF;
END $$;

-- 7) Optional: set sort_index automatically per project when not provided
-- Safe to keep even if your app assigns the value; DB will only fill when NULL.
CREATE OR REPLACE FUNCTION public.tasks_default_sort_index()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.sort_index IS NULL THEN
    SELECT COALESCE(MAX(t.sort_index), 0) + 1 INTO NEW.sort_index
    FROM public.tasks t
    WHERE t.project_id = NEW.project_id;
  END IF;
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS trg_tasks_default_sort_index ON public.tasks;
CREATE TRIGGER trg_tasks_default_sort_index
BEFORE INSERT ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.tasks_default_sort_index();

-- 8) Clean up duplicate permissive RLS policy on tasks (keep tasks_select_all)
DROP POLICY IF EXISTS tasks_select ON public.tasks;

COMMIT;

-- Notes:
-- - All changes are idempotent: safe to run multiple times.
-- - If you plan to tighten security later, we can replace the permissive RLS policies
--   (to public using true) with role-scoped policies for authenticated users/projects.
