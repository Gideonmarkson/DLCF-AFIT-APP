import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseCode = searchParams.get('courseCode') || 'AEE 311';

  return NextResponse.json({
    status: 'success',
    data: {
      courseCode,
      courseTitle: 'Aerodynamics I',
      peers: [
        {
          id: 'usr_99',
          fullName: 'Brother Samuel Okoh',
          department: 'Aeronautical Engineering',
          level: 300,
          avatarUrl: null,
        },
        {
          id: 'usr_100',
          fullName: 'Brother Victor Jude',
          department: 'Aeronautical Engineering',
          level: 300,
          avatarUrl: null,
        },
      ],
      seniorMentors: [
        {
          id: 'usr_12',
          fullName: 'Brother Daniel Adebayo',
          department: 'Aeronautical Engineering',
          level: 500,
          gradeEarned: 'A',
          cgpa: 4.82,
          avatarUrl: null,
        },
        {
          id: 'usr_15',
          fullName: 'Sister Faith Ogundele',
          department: 'Mechanical Engineering',
          level: 400,
          gradeEarned: 'B',
          cgpa: 4.65,
          avatarUrl: null,
        },
      ],
    },
  });
}
