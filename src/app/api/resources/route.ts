import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get('level');
  const department = searchParams.get('department');

  const mockPastQuestions = [
    { id: 'pq-101', title: 'AEE 311 Aerodynamics I (2023 Exam)', level: '300L', department: 'Aerospace Engineering', year: '2023', fileUrl: '/sample_pq.pdf' },
    { id: 'pq-102', title: 'MET 301 Fluid Mechanics II (2022 Exam)', level: '300L', department: 'Mechanical Engineering', year: '2022', fileUrl: '/sample_pq.pdf' },
  ];

  return NextResponse.json({ success: true, resources: mockPastQuestions });
}
