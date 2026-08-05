import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendMentorAssignmentEmail(params: { mentorEmail: string; mentorName: string; studentName: string }) {
  if (!resend) {
    console.log(`[Resend Email Mock] Mentor assignment notice sent to ${params.mentorEmail}`);
    return { success: true, mock: true };
  }
  try {
    const data = await resend.emails.send({
      from: 'DLCF AFIT <onboarding@resend.dev>',
      to: [params.mentorEmail],
      subject: 'You have been paired as an Academic Mentor',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #ffffff; color: #1F2937;">
          <h2 style="color: #1D4ED8;">Hi ${params.mentorName},</h2>
          <p>You've been paired as an academic mentor for <strong>${params.studentName}</strong>, a fellow DLCF AFIT student who could use support this semester.</p>
          <p>Please reach out to them directly when you're able.</p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error sending mentor assignment email:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(params: { toEmail: string; fullName: string; role: string }) {
  if (!resend) {
    console.log(`[Resend Email Mock] Welcome email sent to ${params.toEmail}`);
    return { success: true, mock: true };
  }

  const roleLabel =
    params.role === 'STUDENT_EXECUTIVE' ? 'Student Executive' :
    params.role === 'ASSOCIATE_COORDINATOR' ? 'Associate Coordinator' :
    'Student';

  try {
    const data = await resend.emails.send({
      from: 'DLCF AFIT <onboarding@resend.dev>',
      to: [params.toEmail],
      subject: 'Welcome to the DLCF AFIT Saintly Intellectuals Hub',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #ffffff; color: #1F2937;">
          <h2 style="color: #1D4ED8;">Welcome, ${params.fullName}!</h2>
          <p>Your DLCF AFIT Hub account has been created as a <strong>${roleLabel}</strong>.</p>
          <p>You can now sign in and access course registration, confidential counseling, devotionals, and the fellowship directory.</p>
          <p style="margin-top: 20px; font-size: 12px; color: #6B7280;">If you didn't request this account, you can ignore this email.</p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}
export async function sendCounselingNotification(params: {
  advisorEmails: string[];
  subject: string;
  messageSnippet: string;
  ticketId: string;
  isAnonymous: boolean;
}) {
  if (params.advisorEmails.length === 0) {
    console.log('[Resend] No Associate Coordinator emails on file — skipping notification.');
    return { success: false, skipped: true };
  }

  if (!resend) {
    console.log(`[Resend Email Mock] Notification sent to ${params.advisorEmails.join(', ')} for Counseling Ticket #${params.ticketId}`);
    return { success: true, mock: true };
  }

  try {
    const data = await resend.emails.send({
      from: 'DLCF AFIT Counseling Hub <onboarding@resend.dev>',
      to: params.advisorEmails,
      subject: `[Confidential Counseling Request] ${params.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: #f8fafc; border-radius: 8px;">
          <h2 style="color: #22d3ee;">Confidential Counseling Ticket Alert</h2>
          <p>Dear Associate Coordinator,</p>
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
