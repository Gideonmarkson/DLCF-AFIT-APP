import { NextRequest, NextResponse } from 'next/server';
import { sendCounselingNotification } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, category, message, isAnonymous, advisorEmail, advisorName, ticketId } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required fields' },
        { status: 400 }
      );
    }

    // Dispatch email alert to Associate Coordinator via Resend
    const emailResult = await sendCounselingNotification({
      advisorEmail: advisorEmail || 'samuel.okosun@afit.edu.ng',
      advisorName: advisorName || 'Pastor Samuel Okosun',
      subject,
      messageSnippet: message,
      ticketId: ticketId || `T-${Math.floor(100 + Math.random() * 900)}`,
      isAnonymous: Boolean(isAnonymous),
    });

    return NextResponse.json({
      success: true,
      message: 'Counseling request submitted and advisor notified',
      ticketId: ticketId || `T-${Math.floor(100 + Math.random() * 900)}`,
      emailResult,
    });
  } catch (error) {
    console.error('Error processing counseling submission:', error);
    return NextResponse.json(
      { error: 'Failed to submit counseling ticket' },
      { status: 500 }
    );
  }
}
