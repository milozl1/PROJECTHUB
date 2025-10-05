-- Verification checklist (safe): summarizes schema and runs ephemeral tests inside a transaction, then ROLLBACK
-- Paste into Supabase SQL Editor and run. Notices will indicate PASS/FAIL for each test.

-- ===== 1) Read-only summaries =====

-- Use pg_class.relrowsecurity to detect RLS status (information_schema.tables doesn't expose it)
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('r','p')
  AND c.relname IN (
    'audit_log','comments','notifications','project_members','project_tags',
    'projects','subtasks','tags','task_dependencies','task_tags','tasks','time_entries','users'
  )
ORDER BY c.relname;

-- Policies count per table
SELECT pol.tablename, COUNT(*) AS policies
FROM pg_policies pol
WHERE pol.schemaname='public'
GROUP BY pol.tablename
ORDER BY pol.tablename;

-- Indexes overview (key ones)
SELECT indexname
FROM pg_indexes
WHERE schemaname='public' AND tablename='tasks'
ORDER BY indexname;

SELECT indexname
FROM pg_indexes
WHERE schemaname='public' AND tablename='task_dependencies'
ORDER BY indexname;

SELECT indexname
FROM pg_indexes
WHERE schemaname='public' AND tablename='subtasks'
ORDER BY indexname;

-- Triggers on tasks
SELECT tgname
FROM pg_trigger
WHERE tgrelid='public.tasks'::regclass AND NOT tgisinternal
ORDER BY tgname;

-- Constraints on task_dependencies
SELECT conname, contype
FROM pg_constraint
WHERE conrelid='public.task_dependencies'::regclass
ORDER BY conname;

-- ===== 2) Ephemeral behavior tests (rolled back) =====
BEGIN;
DO $$
DECLARE
  _proj uuid;
  _t1 uuid; _t2 uuid; _t3 uuid;
  _sub uuid;
  _sidx int;
  _cnt int;
  _sv tsvector;
  _t_before timestamptz;
  _t_after timestamptz;
BEGIN
  -- Create a temp project
  INSERT INTO public.projects(name,status,priority) VALUES ('__verify_project__','Not Started','Medium') RETURNING id INTO _proj;

  -- sort_index default on insert
  INSERT INTO public.tasks(project_id,title) VALUES (_proj,'__verify_t1__') RETURNING id, sort_index, updated_at INTO _t1, _sidx, _t_before;
  IF _sidx IS NULL THEN RAISE EXCEPTION 'FAIL: sort_index not assigned on insert'; END IF;
  RAISE NOTICE 'PASS: sort_index assigned on t1 = %', _sidx;

  INSERT INTO public.tasks(project_id,title) VALUES (_proj,'__verify_t2__') RETURNING id, sort_index INTO _t2, _sidx;
  RAISE NOTICE 'PASS: sort_index assigned on t2 = %', _sidx;

  -- tasks_search_vector trigger + updated_at trigger
  -- Note: now() is constant within a transaction, so we don't compare timestamps directly for increase.
  UPDATE public.tasks SET title='__tv__ foo bar' WHERE id=_t1 RETURNING search_vector, updated_at INTO _sv, _t_after;
  IF _sv IS NULL THEN RAISE EXCEPTION 'FAIL: search_vector not populated on update'; END IF;
  IF _t_after IS NULL THEN RAISE EXCEPTION 'FAIL: updated_at is NULL after update'; END IF;
  RAISE NOTICE 'PASS: search_vector populated and updated_at present after update';

  -- self-dependency blocked by CHECK constraint
  BEGIN
    INSERT INTO public.task_dependencies(predecessor_task_id, successor_task_id) VALUES (_t1,_t1);
    RAISE EXCEPTION 'FAIL: self-dependency unexpectedly allowed';
  EXCEPTION WHEN check_violation OR unique_violation THEN
    RAISE NOTICE 'PASS: self-dependency correctly blocked';
  END;

  -- Cascade delete on subtasks
  INSERT INTO public.tasks(project_id,title) VALUES (_proj,'__verify_t3__') RETURNING id INTO _t3;
  INSERT INTO public.subtasks(task_id,title) VALUES (_t3,'__verify_sub__') RETURNING id INTO _sub;
  DELETE FROM public.tasks WHERE id=_t3;
  SELECT COUNT(*) INTO _cnt FROM public.subtasks WHERE id=_sub;
  IF _cnt <> 0 THEN RAISE EXCEPTION 'FAIL: subtask did not cascade on task delete'; END IF;
  RAISE NOTICE 'PASS: subtask cascaded on task delete';
END $$;
ROLLBACK;

-- ===== 3) Optional: quick data health checks =====
-- Duplicate dependency pairs (should be zero)
SELECT predecessor_task_id, successor_task_id, COUNT(*)
FROM public.task_dependencies
GROUP BY 1,2
HAVING COUNT(*) > 1;

-- Tasks missing project or title (should be zero)
SELECT COUNT(*) AS tasks_missing_fields
FROM public.tasks
WHERE project_id IS NULL OR title IS NULL OR title='';

-- ===== 4) Deeper health checks (read-only) =====

-- Orphan subtasks (should be zero due to FK CASCADE)
SELECT COUNT(*) AS orphan_subtasks
FROM public.subtasks s
LEFT JOIN public.tasks t ON t.id = s.task_id
WHERE t.id IS NULL;

-- Orphan dependencies (should be zero)
SELECT COUNT(*) AS orphan_deps_from
FROM public.task_dependencies d
LEFT JOIN public.tasks t ON t.id = d.predecessor_task_id
WHERE t.id IS NULL;

SELECT COUNT(*) AS orphan_deps_to
FROM public.task_dependencies d
LEFT JOIN public.tasks t ON t.id = d.successor_task_id
WHERE t.id IS NULL;

-- Duplicate sort_index inside a project (not fatal, but can cause unstable ordering)
SELECT project_id, sort_index, COUNT(*) AS cnt
FROM public.tasks
WHERE sort_index IS NOT NULL
GROUP BY project_id, sort_index
HAVING COUNT(*) > 1
ORDER BY cnt DESC, project_id, sort_index
LIMIT 50;

-- Date sanity: start_date should not be after due_date (tasks and subtasks)
SELECT COUNT(*) AS tasks_bad_dates
FROM public.tasks
WHERE start_date IS NOT NULL AND due_date IS NOT NULL AND start_date > due_date;

SELECT COUNT(*) AS subtasks_bad_dates
FROM public.subtasks
WHERE start_date IS NOT NULL AND due_date IS NOT NULL AND start_date > due_date;

-- Search vector should be populated when title/description present
SELECT COUNT(*) AS tasks_missing_search_vector
FROM public.tasks
WHERE (COALESCE(title,'') <> '' OR COALESCE(description,'') <> '')
  AND search_vector IS NULL;

-- Dependency cycles (bounded depth up to 10). Result set should be empty.
WITH RECURSIVE walk AS (
  SELECT predecessor_task_id, successor_task_id, predecessor_task_id AS root,
         ARRAY[predecessor_task_id, successor_task_id] AS path
  FROM public.task_dependencies
  UNION ALL
  SELECT w.predecessor_task_id, td.successor_task_id, w.root, w.path || td.successor_task_id
  FROM walk w
  JOIN public.task_dependencies td ON td.predecessor_task_id = w.successor_task_id
  WHERE array_length(w.path,1) < 10 AND NOT td.successor_task_id = ANY(w.path)
)
SELECT root AS cycle_start, successor_task_id AS cycle_end, path
FROM walk
WHERE successor_task_id = root
LIMIT 50;
