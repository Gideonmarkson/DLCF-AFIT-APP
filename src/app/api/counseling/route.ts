import { NextResponse } from 'next/server';
import { sendCounselingNotification } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, message, advisorId, isAnonymous } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const ticketId = 't-' + Math.floor(100 + Math.random() * 900);

    // Trigger Resend email notification
    await sendCounselingNotification({
      advisorEmail: 'advisor@dlcf-afit.org',
      advisorName: 'Bro. Samuel Okosun',
      subject,
      messageSnippet: message,
      ticketId,
      isAnonymous: Boolean(isAnonymous),
    });

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Counseling request logged. Email alert dispatched to advisor via Resend.',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
