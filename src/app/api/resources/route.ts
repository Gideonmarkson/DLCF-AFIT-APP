import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const courseCode = searchParams.get('courseCode');

  const resources = [
    {
      id: 'res-1',
      title: 'AEE 311 Aerodynamics I Past Questions (2019 - 2024)',
      category: 'PAST_QUESTION',
      courseCode: 'AEE 311',
      fileUrl: '/resources/aee311_past_questions.pdf',
      downloadCount: 142,
    },
    {
      id: 'res-2',
      title: 'MET 201 Thermodynamics Solved Exam Solutions',
      category: 'PAST_QUESTION',
      courseCode: 'MET 201',
      fileUrl: '/resources/met201_solutions.pdf',
      downloadCount: 198,
    },
    {
      id: 'res-3',
      title: 'DLCF Weekly Devotional Guide - Month of Wisdom',
      category: 'DEVOTIONAL',
      fileUrl: '/resources/dlcf_devotional_guide.pdf',
      downloadCount: 88,
    },
  ];

  return NextResponse.json({
    status: 'success',
    data: resources,
  });
}
