-- Mentor pairing, set by the Academic Director (a specific exco office),
-- not an automated algorithm — matches how DLCF AFIT actually wants this run.
CREATE TABLE IF NOT EXISTS public.mentor_pairings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  paired_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(student_id)
);
ALTER TABLE public.mentor_pairings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pairings viewable by those involved or any exco/coordinator"
ON public.mentor_pairings FOR SELECT TO authenticated
USING (
  student_id = auth.uid() OR mentor_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('STUDENT_EXECUTIVE', 'ASSOCIATE_COORDINATOR'))
);

-- Only the Academic Director office may create/change pairings.
CREATE POLICY "Only Academic Director can create pairings"
ON public.mentor_pairings FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND executive_office = 'Academic Director')
);
CREATE POLICY "Only Academic Director can update pairings"
ON public.mentor_pairings FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND executive_office = 'Academic Director'));
CREATE POLICY "Only Academic Director can remove pairings"
ON public.mentor_pairings FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND executive_office = 'Academic Director'));

-- Scholarships — no table existed at all before, hence "points to nothing."
CREATE TABLE IF NOT EXISTS public.scholarships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  amount TEXT,
  deadline TIMESTAMPTZ,
  application_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scholarships viewable by authenticated users"
ON public.scholarships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only Academic Director manages scholarships"
ON public.scholarships FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND executive_office = 'Academic Director'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND executive_office = 'Academic Director'));

-- courses / student_registered_courses / resources never had RLS enabled at
-- all — wide open with no restriction whatsoever until now.
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_registered_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Courses are viewable by authenticated users"
ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Academic Director manages the course catalog"
ON public.courses FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND executive_office = 'Academic Director'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND executive_office = 'Academic Director'));

CREATE POLICY "Students manage their own course registrations"
ON public.student_registered_courses FOR ALL TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());
CREATE POLICY "Exco/Coordinators can view all registrations"
ON public.student_registered_courses FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('STUDENT_EXECUTIVE', 'ASSOCIATE_COORDINATOR')));

CREATE POLICY "Resources are viewable by authenticated users"
ON public.resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Academic Director manages resources"
ON public.resources FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND executive_office = 'Academic Director'));
CREATE POLICY "Academic Director can remove resources"
ON public.resources FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND executive_office = 'Academic Director'));

-- Storage buckets for course slips, result slips, and past-question files.
INSERT INTO storage.buckets (id, name, public) VALUES ('course-slips', 'course-slips', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('result-slips', 'result-slips', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('resources-files', 'resources-files', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Course slips are publicly viewable" ON storage.objects FOR SELECT USING (bucket_id = 'course-slips');
CREATE POLICY "Users upload their own course slip" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'course-slips' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users replace their own course slip" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'course-slips' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Result slips are publicly viewable" ON storage.objects FOR SELECT USING (bucket_id = 'result-slips');
CREATE POLICY "Users upload their own result slip" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'result-slips' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users replace their own result slip" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'result-slips' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Resource files are publicly viewable" ON storage.objects FOR SELECT USING (bucket_id = 'resources-files');
CREATE POLICY "Academic Director uploads resource files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resources-files' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND executive_office = 'Academic Director'));

-- Persistent course registration slip, one per student, replaced not duplicated.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS course_slip_url TEXT;
GRANT UPDATE (course_slip_url) ON public.profiles TO authenticated;

-- Students could INSERT a result but never UPDATE one (e.g. re-upload a slip).
CREATE POLICY "Students can update own results"
ON public.student_results FOR UPDATE TO authenticated
USING (auth.uid() = student_id);
