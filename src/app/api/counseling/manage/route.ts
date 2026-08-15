import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendCounselingResolutionEmail } from '@/lib/resend';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: actor } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (actor?.role !== 'ASSOCIATE_COORDINATOR') {
    return NextResponse.json({ error: 'Associate Coordinator access required.' }, { status: 403 });
  }

  const body = await request.json();
  const ticketId = typeof body.ticketId === 'string' ? body.ticketId : '';
  const action = body.action;
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!ticketId || !['open', 'reply', 'status'].includes(action)) {
    return NextResponse.json({ error: 'Invalid counseling action.' }, { status: 400 });
  }

  const { data: ticket, error: ticketError } = await supabase
    .from('counseling_requests')
    .select('id, student_id, subject, status')
    .eq('id', ticketId)
    .single();
  if (ticketError || !ticket) {
    return NextResponse.json({ error: ticketError?.message ?? 'Ticket not found.' }, { status: 404 });
  }

  if (action === 'open') {
    if (ticket.status === 'PENDING') {
      const { error } = await supabase.from('counseling_requests').update({ status: 'IN_PROGRESS' }).eq('id', ticketId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, status: 'IN_PROGRESS' });
  }

  if (action === 'status') {
    const status = body.status;
    // RESOLVED is intentionally not allowed here. A ticket may only become
    // RESOLVED by sending a reply (below), so the resolution email to the
    // student is never skipped by a direct status flip.
    if (status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'A ticket can only be resolved by sending a reply, so the student is notified.' },
        { status: 400 }
      );
    }
    const { error } = await supabase.from('counseling_requests').update({ status }).eq('id', ticketId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, status });
  }

  if (!message) return NextResponse.json({ error: 'Reply cannot be empty.' }, { status: 400 });

  const { error: replyError } = await supabase.from('counseling_replies').insert({
    request_id: ticketId,
    responder_id: user.id,
    message,
  });
  if (replyError) return NextResponse.json({ error: replyError.message }, { status: 400 });

  const { error: resolveError } = await supabase.from('counseling_requests').update({ status: 'RESOLVED' }).eq('id', ticketId);
  if (resolveError) return NextResponse.json({ error: resolveError.message }, { status: 400 });

  const { data: student } = await supabase.from('profiles').select('full_name, email').eq('id', ticket.student_id).single();
  if (student?.email) {
    void sendCounselingResolutionEmail({
      studentEmail: student.email,
      studentName: student.full_name ?? 'there',
      subject: ticket.subject,
    });
  }

  return NextResponse.json({ success: true, status: 'RESOLVED' });
}
