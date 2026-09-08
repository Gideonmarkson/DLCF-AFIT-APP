-- DLCF AFIT academic registration/result production fix
-- Idempotent migration: safe to run against an existing project.

-- 1) Ensure the academic document buckets exist.
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-slips', 'course-slips', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

INSERT INTO storage.buckets (id, name, public)
VALUES ('result-slips', 'result-slips', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 2) Recreate only the academic storage policies so a partially-applied
--    deployment cannot leave uploads failing with opaque "Failed to fetch" errors.
DROP POLICY IF EXISTS "Course slips are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users upload their own course slip" ON storage.objects;
DROP POLICY IF EXISTS "Users replace their own course slip" ON storage.objects;
DROP POLICY IF EXISTS "Users delete their own course slip" ON storage.objects;
DROP POLICY IF EXISTS "Result slips are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users upload their own result slip" ON storage.objects;
DROP POLICY IF EXISTS "Users replace their own result slip" ON storage.objects;
DROP POLICY IF EXISTS "Users delete their own result slip" ON storage.objects;

CREATE POLICY "Course slips are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-slips');

CREATE POLICY "Users upload their own course slip"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'course-slips'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users replace their own course slip"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'course-slips'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'course-slips'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users delete their own course slip"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'course-slips'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Result slips are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'result-slips');

CREATE POLICY "Users upload their own result slip"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'result-slips'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users replace their own result slip"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'result-slips'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'result-slips'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users delete their own result slip"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'result-slips'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3) Ensure student_results can be updated by its owner. The existing
--    repository already contains this policy in the academic RLS migration;
--    recreating it here makes this fix self-contained for deployments that
--    skipped or partially applied migrations.
DROP POLICY IF EXISTS "Students can update own results" ON public.student_results;
CREATE POLICY "Students can update own results"
ON public.student_results FOR UPDATE TO authenticated
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- 4) Ensure the profile column used by course registration is writable by
--    authenticated users through the existing own-profile UPDATE policy.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS course_slip_url TEXT;
GRANT UPDATE (course_slip_url) ON public.profiles TO authenticated;

-- 5) Re-state the uniqueness required by the application's upsert conflict
--    target without changing existing data.
CREATE UNIQUE INDEX IF NOT EXISTS student_results_student_session_semester_uidx
ON public.student_results (student_id, academic_session, semester);

CREATE UNIQUE INDEX IF NOT EXISTS student_registered_courses_student_course_session_semester_uidx
ON public.student_registered_courses (student_id, course_id, academic_session, semester);
