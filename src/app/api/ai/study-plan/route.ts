import { NextRequest, NextResponse } from 'next/server';
import { generateStudyPlan, generatePersonalStudyPlan } from '@/lib/gemini';

// Runs server-side only. GEMINI_API_KEY must never be read from a client
// component — Next.js strips non-NEXT_PUBLIC_ env vars from the browser
// bundle, so a client-side call to lib/gemini.ts silently always hits the
// hardcoded fallback text regardless of a valid key being set on Vercel.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, topics, targetCgpa, hoursAvailable } = body;

    if (!Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json(
        { error: 'At least one course or topic is required.' },
        { status: 400 }
      );
    }

    const hours = Number(hoursAvailable);
    if (!Number.isFinite(hours) || hours < 1) {
      return NextResponse.json(
        { error: 'Weekly study hours must be a positive number.' },
        { status: 400 }
      );
    }

    const plan =
      mode === 'personal'
        ? await generatePersonalStudyPlan(topics, hours)
        : await generateStudyPlan(topics, Number(targetCgpa) || 0, hours);

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error('Error generating AI study plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI study schedule' },
      { status: 500 }
    );
  }
}
