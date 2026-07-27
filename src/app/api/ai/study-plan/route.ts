import { NextResponse } from 'next/server';
import { generateStudyPlan } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courses = [], targetCgpa = 4.5, hoursAvailable = 15 } = body;

    const planMarkdown = await generateStudyPlan(courses, targetCgpa, hoursAvailable);

    return NextResponse.json({
      success: true,
      personalizedSchedule: planMarkdown,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate study plan' }, { status: 500 });
  }
}
