import { GradeLetter } from './database.types';

export interface ResultRowInput {
  id: string;
  courseCode: string;
  courseTitle: string;
  creditUnits: number;
  grade: GradeLetter;
}

export interface ResultSubmissionPayload {
  academicSession: string;
  semester: 1 | 2;
  level: 100 | 200 | 300 | 400 | 500;
  fileUrl?: string;
  items: Array<{
    courseCode: string;
    courseTitle: string;
    creditUnits: number;
    grade: GradeLetter;
  }>;
}

export interface PeerMatchPeer {
  id: string;
  fullName: string;
  department: string;
  level: number;
  avatarUrl?: string | null;
}

export interface SeniorMentor {
  id: string;
  fullName: string;
  department: string;
  level: number;
  gradeEarned: GradeLetter;
  avatarUrl?: string | null;
  cgpa: number;
}

export interface PeerMatchGraph {
  courseCode: string;
  courseTitle: string;
  peers: PeerMatchPeer[];
  seniorMentors: SeniorMentor[];
}
