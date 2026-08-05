import { NextRequest, NextResponse } from 'next/server';
import { sendMentorAssignmentEmail } from '@/lib/resend';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const sessionClient = await createServerClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });
  }

  const { mentorEmail, mentorName, studentName } = await req.json();
  if (!mentorEmail || !mentorName || !studentName) {
    return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
  }

  const result = await sendMentorAssignmentEmail({ mentorEmail, mentorName, studentName });
  return NextResponse.json(result);
}
