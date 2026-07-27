import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendCounselingNotification(params: {
  advisorEmail: string;
  advisorName: string;
  subject: string;
  messageSnippet: string;
  ticketId: string;
  isAnonymous: boolean;
}) {
  if (!resend) {
    console.log(`[Resend Email Mock] Notification sent to ${params.advisorEmail} for Counseling Ticket #${params.ticketId}`);
    return { success: true, mock: true };
  }

  try {
    const data = await resend.emails.send({
      from: 'DLCF AFIT Counseling Hub <counseling@dlcf-afit.org>',
      to: [params.advisorEmail],
      subject: `[Confidential Counseling Request] ${params.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: #f8fafc; border-radius: 8px;">
          <h2 style="color: #22d3ee;">Confidential Counseling Ticket Alert</h2>
          <p>Dear ${params.advisorName},</p>
          <p>A new counseling request has been assigned to you on the <strong>DLCF AFIT Hub</strong>.</p>
          <div style="background-color: #1e293b; padding: 15px; border-left: 4px solid #06b6d4; margin: 15px 0;">
            <p><strong>Subject:</strong> ${params.subject}</p>
            <p><strong>Sender:</strong> ${params.isAnonymous ? 'Anonymous Brethren' : 'Confidential Student'}</p>
            <p><strong>Snippet:</strong> ${params.messageSnippet.substring(0, 150)}...</p>
          </div>
          <p>Please log in to your Associate Coordinator Portal to review and respond securely.</p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error sending counseling notification email:', error);
    return { success: false, error };
  }
}
