-- 1. Update the profiles table
ALTER TABLE public.profiles ALTER COLUMN current_level DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN current_level TYPE TEXT USING current_level::TEXT;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_current_level_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_current_level_check
  CHECK (current_level IS NULL OR current_level IN ('100','200','300','400','500','ND1','ND2','HND1','HND2','REMEDIAL','IJMB'));

-- 2. Update the courses table
ALTER TABLE public.courses ALTER COLUMN level TYPE TEXT USING level::TEXT;
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_level_check;
ALTER TABLE public.courses ADD CONSTRAINT courses_level_check
  CHECK (level IN ('100','200','300','400','500','ND1','ND2','HND1','HND2','REMEDIAL','IJMB'));

-- 3. Update the student_results table
ALTER TABLE public.student_results ALTER COLUMN level TYPE TEXT USING level::TEXT;
ALTER TABLE public.student_results DROP CONSTRAINT IF EXISTS student_results_level_check;
ALTER TABLE public.student_results ADD CONSTRAINT student_results_level_check
  CHECK (level IN ('100','200','300','400','500','ND1','ND2','HND1','HND2','REMEDIAL','IJMB'));
