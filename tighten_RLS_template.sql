-- tighten_RLS_template.sql
-- Read me first:
-- 1) This is a template. It will NOT run automatically. Review and run sections you want.
-- 2) Choose one of the two approaches:
--    A) Minimal hardening: allow only the 'authenticated' role (keeps logic permissive but blocks 'anon').
--    B) Project-membership policies (strict): users must be members of the related project. Requires that auth.uid() equals public.users.id.
--       If your users.id is not the auth uid, set up a mapping first, or adapt predicates accordingly.
-- 3) All DDL is idempotent-ish with IF EXISTS/IF NOT EXISTS, but you should still review.

-- =========================================================
-- A) Minimal hardening: restrict to 'authenticated' role
-- =========================================================
-- This replaces existing permissive 'public' policies with 'authenticated'.
-- Run this if you use Supabase Auth and your client uses an authenticated session.

BEGIN;

-- audit_log
DROP POLICY IF EXISTS audit_log_insert_all ON public.audit_log;
DROP POLICY IF EXISTS audit_log_select_all ON public.audit_log;
CREATE POLICY audit_log_insert_all ON public.audit_log FOR INSERT TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY audit_log_select_all ON public.audit_log FOR SELECT TO authenticated USING (true);

-- project_members
DROP POLICY IF EXISTS project_members_all ON public.project_members;
CREATE POLICY project_members_all ON public.project_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- projects
DROP POLICY IF EXISTS projects_delete_all ON public.projects;
DROP POLICY IF EXISTS projects_insert_all ON public.projects;
DROP POLICY IF EXISTS projects_select_all ON public.projects;
DROP POLICY IF EXISTS projects_update_all ON public.projects;
CREATE POLICY projects_delete_all ON public.projects FOR DELETE TO authenticated USING (true);
CREATE POLICY projects_insert_all ON public.projects FOR INSERT TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY projects_select_all ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY projects_update_all ON public.projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- subtasks
DROP POLICY IF EXISTS "subtasks delete" ON public.subtasks;
DROP POLICY IF EXISTS "subtasks insert" ON public.subtasks;
DROP POLICY IF EXISTS "subtasks select" ON public.subtasks;
DROP POLICY IF EXISTS "subtasks update" ON public.subtasks;
CREATE POLICY "subtasks delete" ON public.subtasks FOR DELETE TO authenticated USING (true);
CREATE POLICY "subtasks insert" ON public.subtasks FOR INSERT TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "subtasks select" ON public.subtasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "subtasks update" ON public.subtasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- tags
DROP POLICY IF EXISTS tags_all ON public.tags;
CREATE POLICY tags_all ON public.tags FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- task_dependencies
DROP POLICY IF EXISTS "deps delete" ON public.task_dependencies;
DROP POLICY IF EXISTS "deps insert" ON public.task_dependencies;
DROP POLICY IF EXISTS "deps select" ON public.task_dependencies;
DROP POLICY IF EXISTS "deps update" ON public.task_dependencies;
CREATE POLICY "deps delete" ON public.task_dependencies FOR DELETE TO authenticated USING (true);
CREATE POLICY "deps insert" ON public.task_dependencies FOR INSERT TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "deps select" ON public.task_dependencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "deps update" ON public.task_dependencies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- task_tags
DROP POLICY IF EXISTS task_tags_pkey ON public.task_tags; -- no policy existed; ignore if error
-- No default policies listed in snapshot; add permissive-to-authenticated if needed
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='task_tags'
  ) THEN
    EXECUTE 'CREATE POLICY task_tags_all ON public.task_tags FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- tasks
DROP POLICY IF EXISTS tasks_delete_all ON public.tasks;
DROP POLICY IF EXISTS tasks_insert_all ON public.tasks;
DROP POLICY IF EXISTS tasks_select ON public.tasks;
DROP POLICY IF EXISTS tasks_select_all ON public.tasks;
DROP POLICY IF EXISTS tasks_update_all ON public.tasks;
CREATE POLICY tasks_delete_all ON public.tasks FOR DELETE TO authenticated USING (true);
CREATE POLICY tasks_insert_all ON public.tasks FOR INSERT TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY tasks_select_all ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY tasks_update_all ON public.tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- time_entries (no explicit policies in snapshot; add permissive-to-authenticated)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='time_entries'
  ) THEN
    EXECUTE 'CREATE POLICY time_entries_all ON public.time_entries FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- users
DROP POLICY IF EXISTS users_all ON public.users;
CREATE POLICY users_all ON public.users FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMIT;

-- =========================================================
-- B) Strict project-membership policies (COMMENTED OUT)
-- =========================================================
-- IMPORTANT: Requires auth.uid() = public.users.id for the logged-in user.
-- Uncomment to apply.

-- BEGIN;
-- -- tasks: only members of the task's project
-- DROP POLICY IF EXISTS tasks_delete_all ON public.tasks;
-- DROP POLICY IF EXISTS tasks_insert_all ON public.tasks;
-- DROP POLICY IF EXISTS tasks_select_all ON public.tasks;
-- DROP POLICY IF EXISTS tasks_update_all ON public.tasks;
-- CREATE POLICY tasks_select_members ON public.tasks FOR SELECT TO authenticated
--   USING (EXISTS (
--     SELECT 1 FROM public.project_members pm
--     WHERE pm.project_id = tasks.project_id AND pm.user_id = auth.uid()
--   ));
-- CREATE POLICY tasks_insert_members ON public.tasks FOR INSERT TO authenticated
--   WITH CHECK (EXISTS (
--     SELECT 1 FROM public.project_members pm
--     WHERE pm.project_id = tasks.project_id AND pm.user_id = auth.uid()
--   ));
-- CREATE POLICY tasks_update_members ON public.tasks FOR UPDATE TO authenticated
--   USING (EXISTS (
--     SELECT 1 FROM public.project_members pm
--     WHERE pm.project_id = tasks.project_id AND pm.user_id = auth.uid()
--   )) WITH CHECK (EXISTS (
--     SELECT 1 FROM public.project_members pm
--     WHERE pm.project_id = tasks.project_id AND pm.user_id = auth.uid()
--   ));
-- CREATE POLICY tasks_delete_members ON public.tasks FOR DELETE TO authenticated
--   USING (EXISTS (
--     SELECT 1 FROM public.project_members pm
--     WHERE pm.project_id = tasks.project_id AND pm.user_id = auth.uid()
--   ));
--
-- -- subtasks: members of parent task's project
-- DROP POLICY IF EXISTS "subtasks select" ON public.subtasks;
-- DROP POLICY IF EXISTS "subtasks insert" ON public.subtasks;
-- DROP POLICY IF EXISTS "subtasks update" ON public.subtasks;
-- DROP POLICY IF EXISTS "subtasks delete" ON public.subtasks;
-- CREATE POLICY subtasks_select_members ON public.subtasks FOR SELECT TO authenticated
--   USING (EXISTS (
--     SELECT 1 FROM public.tasks t JOIN public.project_members pm ON pm.project_id = t.project_id
--     WHERE t.id = subtasks.task_id AND pm.user_id = auth.uid()
--   ));
-- CREATE POLICY subtasks_insert_members ON public.subtasks FOR INSERT TO authenticated
--   WITH CHECK (EXISTS (
--     SELECT 1 FROM public.tasks t JOIN public.project_members pm ON pm.project_id = t.project_id
--     WHERE t.id = subtasks.task_id AND pm.user_id = auth.uid()
--   ));
-- CREATE POLICY subtasks_update_members ON public.subtasks FOR UPDATE TO authenticated
--   USING (EXISTS (
--     SELECT 1 FROM public.tasks t JOIN public.project_members pm ON pm.project_id = t.project_id
--     WHERE t.id = subtasks.task_id AND pm.user_id = auth.uid()
--   )) WITH CHECK (EXISTS (
--     SELECT 1 FROM public.tasks t JOIN public.project_members pm ON pm.project_id = t.project_id
--     WHERE t.id = subtasks.task_id AND pm.user_id = auth.uid()
--   ));
-- CREATE POLICY subtasks_delete_members ON public.subtasks FOR DELETE TO authenticated
--   USING (EXISTS (
--     SELECT 1 FROM public.tasks t JOIN public.project_members pm ON pm.project_id = t.project_id
--     WHERE t.id = subtasks.task_id AND pm.user_id = auth.uid()
--   ));
--
-- -- task_dependencies: members of both tasks' projects (or same project)
-- DROP POLICY IF EXISTS "deps select" ON public.task_dependencies;
-- DROP POLICY IF EXISTS "deps insert" ON public.task_dependencies;
-- DROP POLICY IF EXISTS "deps update" ON public.task_dependencies;
-- DROP POLICY IF EXISTS "deps delete" ON public.task_dependencies;
-- CREATE POLICY deps_members ON public.task_dependencies FOR ALL TO authenticated
--   USING (EXISTS (
--     SELECT 1 FROM public.tasks p JOIN public.project_members pm ON pm.project_id = p.project_id
--     WHERE p.id = task_dependencies.predecessor_task_id AND pm.user_id = auth.uid()
--   ) AND EXISTS (
--     SELECT 1 FROM public.tasks s JOIN public.project_members pm ON pm.project_id = s.project_id
--     WHERE s.id = task_dependencies.successor_task_id AND pm.user_id = auth.uid()
--   )) WITH CHECK (EXISTS (
--     SELECT 1 FROM public.tasks p JOIN public.project_members pm ON pm.project_id = p.project_id
--     WHERE p.id = task_dependencies.predecessor_task_id AND pm.user_id = auth.uid()
--   ) AND EXISTS (
--     SELECT 1 FROM public.tasks s JOIN public.project_members pm ON pm.project_id = s.project_id
--     WHERE s.id = task_dependencies.successor_task_id AND pm.user_id = auth.uid()
--   ));
--
-- -- projects
-- DROP POLICY IF EXISTS projects_select_all ON public.projects;
-- DROP POLICY IF EXISTS projects_insert_all ON public.projects;
-- DROP POLICY IF EXISTS projects_update_all ON public.projects;
-- DROP POLICY IF EXISTS projects_delete_all ON public.projects;
-- CREATE POLICY projects_select_members ON public.projects FOR SELECT TO authenticated
--   USING (EXISTS (
--     SELECT 1 FROM public.project_members pm WHERE pm.project_id = projects.id AND pm.user_id = auth.uid()
--   ));
-- CREATE POLICY projects_update_members ON public.projects FOR UPDATE TO authenticated
--   USING (EXISTS (
--     SELECT 1 FROM public.project_members pm WHERE pm.project_id = projects.id AND pm.user_id = auth.uid()
--   )) WITH CHECK (EXISTS (
--     SELECT 1 FROM public.project_members pm WHERE pm.project_id = projects.id AND pm.user_id = auth.uid()
--   ));
-- CREATE POLICY projects_delete_members ON public.projects FOR DELETE TO authenticated
--   USING (EXISTS (
--     SELECT 1 FROM public.project_members pm WHERE pm.project_id = projects.id AND pm.user_id = auth.uid()
--   ));
--
-- COMMIT;
