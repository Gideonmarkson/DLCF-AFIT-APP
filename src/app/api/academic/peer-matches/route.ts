import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseCode = searchParams.get('courseCode');

  const mockPeerMatches = [
    {
      id: 'mentor-001',
      name: 'Brother Daniel Adebayo',
      department: 'B.Eng Aerospace Engineering',
      level: '400L',
      cgpa: 4.82,
      gradeEarned: 'A',
      courseCode: 'AEE 311',
      availability: 'Tuesdays & Thursdays (4pm - 6pm)',
    },
    {
      id: 'mentor-002',
      name: 'Sister Blessing Adeyemi',
      department: 'B.Eng Mechanical Engineering',
      level: '500L',
      cgpa: 4.75,
      gradeEarned: 'A',
      courseCode: 'MET 301',
      availability: 'Wednesdays & Saturdays (2pm - 5pm)',
    },
  ];

  if (courseCode) {
    const filtered = mockPeerMatches.filter((m) => m.courseCode.toLowerCase() === courseCode.toLowerCase());
    return NextResponse.json({ success: true, matches: filtered });
  }

  return NextResponse.json({ success: true, matches: mockPeerMatches });
}
