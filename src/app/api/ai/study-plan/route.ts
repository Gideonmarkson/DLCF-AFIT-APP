import { NextRequest, NextResponse } from 'next/server';
import { generateStudyPlan } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courses, targetCgpa, hoursAvailable } = body;

    const result = await generateStudyPlan(
      courses || ['AEE 311', 'MET 301', 'EEE 301'],
      targetCgpa || 4.5,
      hoursAvailable || 15
    );

    return NextResponse.json({ success: true, plan: result });
  } catch (error) {
    console.error('Error generating AI study plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI study schedule' },
      { status: 500 }
    );
  }
}
