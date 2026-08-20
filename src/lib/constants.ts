export interface AFITDepartment {
  name: string;
  category: 'DEGREE' | 'ND' | 'HND';
}

export const AFIT_DEPARTMENTS: AFITDepartment[] = [
  // Degree Programmes (B.Eng / B.Sc)
  { name: 'B.Eng Aerospace Engineering', category: 'DEGREE' },
  { name: 'B.Eng Mechanical Engineering', category: 'DEGREE' },
  { name: 'B.Eng Electrical & Electronics Engineering', category: 'DEGREE' },
  { name: 'B.Eng Civil Engineering', category: 'DEGREE' },
  { name: 'B.Eng Automotive Engineering', category: 'DEGREE' },
  { name: 'B.Eng Mechatronics Engineering', category: 'DEGREE' },
  { name: 'B.Eng Metallurgical & Materials Engineering', category: 'DEGREE' },
  { name: 'B.Eng Information & Communication Technology', category: 'DEGREE' },
  { name: 'B.Sc Computer Science', category: 'DEGREE' },
  { name: 'B.Sc Cyber Security', category: 'DEGREE' },
  { name: 'B.Sc Physics with Electronics', category: 'DEGREE' },
  { name: 'B.Sc Chemistry', category: 'DEGREE' },
  { name: 'B.Sc Mathematics', category: 'DEGREE' },
  { name: 'B.Sc Statistics', category: 'DEGREE' },
  { name: 'B.Sc Business Administration', category: 'DEGREE' },
  { name: 'B.Sc Accounting', category: 'DEGREE' },
  { name: 'B.Sc Economics', category: 'DEGREE' },
  { name: 'B.Sc Banking & Finance', category: 'DEGREE' },
  { name: 'B.Sc International Relations', category: 'DEGREE' },

  // National Diploma (ND) Programmes
  { name: 'ND Aircraft Engineering Technology', category: 'ND' },
  { name: 'ND Mechanical Engineering Technology', category: 'ND' },
  { name: 'ND Electrical/Electronics Engineering Technology', category: 'ND' },
  { name: 'ND Civil Engineering Technology', category: 'ND' },
  { name: 'ND Computer Engineering Technology', category: 'ND' },
  { name: 'ND Computer Science', category: 'ND' },
  { name: 'ND Business Administration & Management', category: 'ND' },
  { name: 'ND Explosives Engineering Technology', category: 'ND' },

  // Higher National Diploma (HND) & Pre-HND Programmes
  { name: 'HND Aircraft Engineering Technology (Avionics)', category: 'HND' },
  { name: 'HND Aircraft Engineering Technology (Airframe & Powerplant)', category: 'HND' },
  { name: 'HND Mechanical Engineering Technology (Power & Machinery)', category: 'HND' },
  { name: 'HND Electrical/Electronics Engineering Technology (Telecoms)', category: 'HND' },
  { name: 'HND Computer Science', category: 'HND' },
  { name: 'HND Business Administration & Management', category: 'HND' },
];

export const DLCF_EXCO_PORTFOLIOS = [
  'General Coordinator',
  'Assistant General Coordinator',
  'Sister Welfare Coordinator',
  'Secretarial Coordinator',
  'Maintenance coordinator',
  'Asst Maintenance Coordinator',
  'Evangelism Coordinator',
  'Follow up Coordinator',
  'Media Coordinator',
  'Asst Media Coord',
  'Drama Coordinator',
  'Prayer Coordinator',
  'Ast Prayer Coord',
  'GPT Head',
  'Choir Master',
  'Asst Choir Master',
  'Hall Representatives',
  'Head Usher',
  'Academic Director',
  'Financial Coordinator',
];

export const FELLOWSHIP_UNITS = [
  'Academics',
  'Choir',
  'Prayer',
  'Ushering',
  'Evangelism',
  'Media',
  'Maintenance',
  'Drama',
  'Organising',
  'Publicity',
  'Follow-Up',
  'Sister Welfare',
];

export const ASSOCIATE_COORDINATOR_ROLES = [
  'Sub-Group Associate coordinator',
  'Associate Coordinator (Brother)',
  'Associate Coordinator (Sister)',
];
