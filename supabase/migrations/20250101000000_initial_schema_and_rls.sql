-- DLCF AFIT SAINTLY INTELLECTUALS HUB DATABASE SCHEMA
-- ENABLE REQUIRED EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM TYPES
CREATE TYPE user_role_type AS ENUM ('GENERAL_STUDENT', 'CHURCH_WORKER', 'STUDENT_EXECUTIVE', 'ASSOCIATE_COORDINATOR');
CREATE TYPE church_unit_type AS ENUM ('CHOIR', 'PRAYER', 'USHERING', 'ACADEMICS', 'PUBLICITY', 'EVANGELISM', 'TECHNICAL', 'SANCTUARY', 'NONE');
CREATE TYPE grade_letter_type AS ENUM ('A', 'B', 'C', 'D', 'E', 'F');
CREATE TYPE counseling_status_type AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE resource_category_type AS ENUM ('PAST_QUESTION', 'DEVOTIONAL', 'UNIT_RESOURCE', 'GENERAL_DOWNLOAD');

-- 1. USERS / PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    matric_number TEXT UNIQUE,
    department TEXT NOT NULL, -- e.g., 'Aeronautical Engineering', 'Mechanical Engineering'
    current_level INT NOT NULL CHECK (current_level IN (100, 200, 300, 400, 500)),
    phone_number TEXT,
    role user_role_type DEFAULT 'GENERAL_STUDENT' NOT NULL,
    church_unit church_unit_type DEFAULT 'NONE' NOT NULL,
    executive_office TEXT, -- e.g., 'General Coordinator', 'Academic Secretary', NULL
    cgpa NUMERIC(3, 2) DEFAULT 0.00,
    is_underperforming BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. ACADEMIC SESSIONS & COURSES
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_code VARCHAR(10) NOT NULL UNIQUE, -- e.g., 'AEE 311'
    course_title TEXT NOT NULL,
    credit_units INT NOT NULL CHECK (credit_units > 0 AND credit_units <= 6),
    department TEXT NOT NULL,
    level INT NOT NULL CHECK (level IN (100, 200, 300, 400, 500)),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. REGISTERED COURSES (PEER MATCHING ENGINE)
CREATE TABLE IF NOT EXISTS public.student_registered_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    academic_session VARCHAR(20) NOT NULL, -- e.g., '2024/2025'
    semester INT NOT NULL CHECK (semester IN (1, 2)),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(student_id, course_id, academic_session, semester)
);

-- 4. STUDENT ACADEMIC RESULTS
CREATE TABLE IF NOT EXISTS public.student_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    academic_session VARCHAR(20) NOT NULL,
    semester INT NOT NULL CHECK (semester IN (1, 2)),
    level INT NOT NULL CHECK (level IN (100, 200, 300, 400, 500)),
    gpa NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
    result_slip_url TEXT, -- Encrypted Supabase storage link
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(student_id, academic_session, semester)
);

-- 5. COURSE GRADE ITEMS (DYNAMIC RESULT SUBMISSION)
CREATE TABLE IF NOT EXISTS public.result_course_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    result_id UUID NOT NULL REFERENCES public.student_results(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    credit_units INT NOT NULL,
    grade grade_letter_type NOT NULL,
    grade_point INT NOT NULL CHECK (grade_point BETWEEN 0 AND 5),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. COUNSELING REQUESTS (STRICT PRIVACY)
CREATE TABLE IF NOT EXISTS public.counseling_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_advisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    status counseling_status_type DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. FORUM POSTS & UNIT ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_unit church_unit_type DEFAULT 'NONE' NOT NULL,
    target_department TEXT, -- NULL means all departments
    is_announcement BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. FORUM COMMENTS
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. ACADEMIC & SPIRITUAL RESOURCES (PAST QUESTIONS & DEVOTIONALS)
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    category resource_category_type NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    download_count INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_underperforming ON public.profiles(is_underperforming) WHERE is_underperforming = TRUE;
CREATE INDEX IF NOT EXISTS idx_reg_courses_course_student ON public.student_registered_courses(course_id, student_id);
CREATE INDEX IF NOT EXISTS idx_results_student ON public.student_results(student_id);
CREATE INDEX IF NOT EXISTS idx_posts_target ON public.forum_posts(target_unit, target_department);

-- ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_course_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counseling_requests ENABLE ROW LEVEL SECURITY;

-- Profiles: Users read basic info of all, but full edit only on own row
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Student Results: ONLY accessible by owner, ASSOCIATE_COORDINATOR, or STUDENT_EXECUTIVE with 'Academic Secretary' office
CREATE POLICY "Results viewable by owner, associate coordinators, and academic sec" 
ON public.student_results FOR SELECT TO authenticated 
USING (
    auth.uid() = student_id 
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND (
            profiles.role = 'ASSOCIATE_COORDINATOR' 
            OR (profiles.role = 'STUDENT_EXECUTIVE' AND profiles.executive_office = 'Academic Secretary')
        )
    )
);

CREATE POLICY "Students can insert own results" 
ON public.student_results FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = student_id);

-- Counseling Requests: ONLY visible to student owner and assigned advisor / Associate Coordinators
CREATE POLICY "Counseling viewable by owner or advisor" 
ON public.counseling_requests FOR SELECT TO authenticated 
USING (
    auth.uid() = student_id 
    OR auth.uid() = assigned_advisor_id 
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'ASSOCIATE_COORDINATOR'
    )
);

CREATE POLICY "Students can submit counseling requests"
ON public.counseling_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = student_id);
