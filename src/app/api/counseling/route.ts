import { NextRequest, NextResponse } from 'next/server';
import { sendCounselingNotification, sendCounselingConfirmation } from '@/lib/resend';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const sessionClient = await createServerClient();
    const {
      data: { user },
    } = await sessionClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'You must be signed in to submit a counseling request.' }, { status: 401 });
    }

    const body = await req.json();
    const { subject, message, isAnonymous } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required fields' }, { status: 400 });
    }

    // Real insert — this IS the ticket, not a side effect of sending an email.
    const { data: ticket, error: insertError } = await sessionClient
      .from('counseling_requests')
      .insert({
        student_id: user.id,
        subject,
        message,
        is_anonymous: Boolean(isAnonymous),
      })
      .select('id')
      .single();

    if (insertError || !ticket) {
      return NextResponse.json({ error: insertError?.message ?? 'Could not submit request.' }, { status: 400 });
    }

    // Notify every real Associate Coordinator on file — not a hardcoded fallback.
    const { data: coordinators } = await sessionClient
      .from('profiles')
      .select('email')
      .eq('role', 'ASSOCIATE_COORDINATOR');

    const advisorEmails = (coordinators ?? []).map((c) => c.email).filter(Boolean) as string[];

    const emailResult = await sendCounselingNotification({
      advisorEmails,
      subject,
      messageSnippet: message,
      ticketId: ticket.id.slice(0, 8),
      isAnonymous: Boolean(isAnonymous),
    });

    const { data: me } = await sessionClient.from('profiles').select('full_name, email').eq('id', user.id).single();
    if (me?.email) {
      sendCounselingConfirmation({ studentEmail: me.email, studentName: me.full_name ?? 'there', subject }).catch((err) =>
        console.error('Student confirmation email failed (non-blocking):', err)
      );
    }

    return NextResponse.json({ success: true, ticketId: ticket.id, emailResult });
  } catch (error) {
    console.error('Error processing counseling submission:', error);
    return NextResponse.json({ error: 'Failed to submit counseling ticket' }, { status: 500 });
  }
}
