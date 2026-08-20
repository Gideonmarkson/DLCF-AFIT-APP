export type UserRole = 'GENERAL_STUDENT' | 'CHURCH_WORKER' | 'STUDENT_EXECUTIVE' | 'ASSOCIATE_COORDINATOR';
export type ChurchUnit = 'CHOIR' | 'PRAYER' | 'USHERING' | 'ACADEMICS' | 'PUBLICITY' | 'EVANGELISM' | 'TECHNICAL' | 'SANCTUARY' | 'NONE';
export type GradeLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type CounselingStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type ResourceCategory = 'PAST_QUESTION' | 'DEVOTIONAL' | 'UNIT_RESOURCE' | 'GENERAL_DOWNLOAD';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  matric_number: string | null;
  department: string;
  current_level: 100 | 200 | 300 | 400 | 500;
  phone_number: string | null;
  role: UserRole;
  church_unit: ChurchUnit;
  executive_office: string | null;
  additional_offices: string[] | null;
  cgpa: number;
  is_underperforming: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  course_code: string;
  course_title: string;
  credit_units: number;
  department: string;
  level: number;
  created_at: string;
}

export interface StudentRegisteredCourse {
  id: string;
  student_id: string;
  course_id: string;
  academic_session: string;
  semester: 1 | 2;
  created_at: string;
  course?: Course;
}

export interface StudentResult {
  id: string;
  student_id: string;
  academic_session: string;
  semester: 1 | 2;
  level: number;
  gpa: number;
  result_slip_url?: string | null;
  is_verified: boolean;
  created_at: string;
  items?: ResultCourseItem[];
}

export interface ResultCourseItem {
  id: string;
  result_id: string;
  course_id: string;
  credit_units: number;
  grade: GradeLetter;
  grade_point: number;
  created_at: string;
  course?: Course;
}

export interface CounselingRequest {
  id: string;
  student_id: string;
  assigned_advisor_id?: string | null;
  subject: string;
  message: string;
  is_anonymous: boolean;
  status: CounselingStatus;
  created_at: string;
  updated_at: string;
  student_profile?: Partial<Profile>;
  advisor_profile?: Partial<Profile>;
}

export interface ForumPost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  target_unit: ChurchUnit;
  target_department?: string | null;
  is_announcement: boolean;
  created_at: string;
  author?: Partial<Profile>;
  comments_count?: number;
}

export interface ForumComment {
  id: string;
  post_id: string;
  author_id: string;
  comment: string;
  created_at: string;
  author?: Partial<Profile>;
}

export interface Resource {
  id: string;
  uploaded_by?: string | null;
  title: string;
  description?: string | null;
  category: ResourceCategory;
  course_id?: string | null;
  file_url: string;
  download_count: number;
  created_at: string;
  course?: Course;
}
