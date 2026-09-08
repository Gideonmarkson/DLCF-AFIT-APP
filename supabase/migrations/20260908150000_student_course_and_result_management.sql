-- DLCF AFIT academic management fixes
--
-- Purpose:
-- 1. Allow authenticated students to add a course code/title that is not yet in
--    the shared catalogue, so course registration is not blocked by catalogue gaps.
-- 2. Keep course catalogue editing/deletion under Academic Director control while
--    permitting student-created catalogue entries to be visible to academic staff.
-- 3. Allow students to delete their own result records.
-- 4. Allow students to delete their own course/result slip files from Storage.
--
-- This migration does NOT add a maximum number of historical result records.
-- The existing unique(student_id, academic_session, semester) constraint already
-- gives the desired behavior: any number of different semesters can be stored,
-- while the same exact semester is updated rather than duplicated.


-- Store manually entered credit units on each student registration.
ALTER TABLE public.student_registered_courses
  ADD COLUMN IF NOT EXISTS credit_units INT;

UPDATE public.student_registered_courses AS scr
SET credit_units = c.credit_units
FROM public.courses AS c
WHERE scr.course_id = c.id
  AND scr.credit_units IS NULL;

ALTER TABLE public.student_registered_courses
  ALTER COLUMN credit_units SET NOT NULL;

ALTER TABLE public.student_registered_courses
  DROP CONSTRAINT IF EXISTS student_registered_courses_credit_units_check;

ALTER TABLE public.student_registered_courses
  ADD CONSTRAINT student_registered_courses_credit_units_check
  CHECK (credit_units > 0 AND credit_units <= 6);

-- The previous FOR ALL policy prevented students from creating a missing course
-- even though the course-registration UI needs to support free-form registration.
DROP POLICY IF EXISTS "Academic Director manages the course catalog" ON public.courses;

CREATE POLICY "Authenticated users can add course catalogue entries"
ON public.courses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Academic Director can update course catalogue entries"
ON public.courses
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.executive_office = 'Academic Director'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.executive_office = 'Academic Director'
  )
);

CREATE POLICY "Academic Director can delete course catalogue entries"
ON public.courses
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.executive_office = 'Academic Director'
  )
);


DROP POLICY IF EXISTS "Students can delete own results" ON public.student_results;

CREATE POLICY "Students can delete own results"
ON public.student_results
FOR DELETE
TO authenticated
USING (auth.uid() = student_id);

-- Keep the existing student-update rule explicit and idempotent.
DROP POLICY IF EXISTS "Students can update own results" ON public.student_results;

CREATE POLICY "Students can update own results"
ON public.student_results
FOR UPDATE
TO authenticated
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);


DROP POLICY IF EXISTS "Users delete their own course slip" ON storage.objects;

CREATE POLICY "Users delete their own course slip"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-slips'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users delete their own result slip" ON storage.objects;

CREATE POLICY "Users delete their own result slip"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'result-slips'
  AND (storage.foldername(name))[1] = auth.uid()::text
);


DROP POLICY IF EXISTS "Students can insert own registered courses" ON public.student_registered_courses;
CREATE POLICY "Students can insert own registered courses"
ON public.student_registered_courses FOR INSERT TO authenticated
WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can delete own registered courses" ON public.student_registered_courses;
CREATE POLICY "Students can delete own registered courses"
ON public.student_registered_courses FOR DELETE TO authenticated
USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can view own registered courses" ON public.student_registered_courses;
CREATE POLICY "Students can view own registered courses"
ON public.student_registered_courses FOR SELECT TO authenticated
USING (auth.uid() = student_id);
