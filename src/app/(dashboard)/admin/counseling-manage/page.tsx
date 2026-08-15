import { redirect } from 'next/navigation';

// This route used to render a fully hardcoded, fake counseling queue
// (static sample tickets, "Mark Resolved" only touched local React state —
// no Supabase call, no email, nothing persisted). Associate Coordinators
// were being sent here by the dashboard CTA and doing all their ticket
// handling against data that was never real.
//
// The actual, DB-backed counseling inbox lives at /spiritual/counseling.
// This route is kept only so old links/bookmarks land somewhere correct
// instead of 404ing or reviving the fake page.
export default function CounselingManageRedirect() {
  redirect('/spiritual/counseling');
}
