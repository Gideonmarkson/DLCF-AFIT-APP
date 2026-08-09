-- Real reply thread for counseling tickets — the coordinator-side "conversation"
-- was entirely fake before, with no table to actually back it.
CREATE TABLE IF NOT EXISTS public.counseling_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES public.counseling_requests(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.counseling_replies ENABLE ROW LEVEL SECURITY;

-- Same visibility rule as the ticket itself: the student who owns it, or any
-- Associate Coordinator.
CREATE POLICY "Reply visibility matches ticket visibility"
ON public.counseling_replies FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.counseling_requests r
    WHERE r.id = request_id
      AND (r.student_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ASSOCIATE_COORDINATOR'))
  )
);

-- Only Associate Coordinators can respond.
CREATE POLICY "Only coordinators can reply"
ON public.counseling_replies FOR INSERT TO authenticated
WITH CHECK (
  responder_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ASSOCIATE_COORDINATOR')
);

-- Coordinators updating a ticket's status (PENDING -> IN_PROGRESS -> RESOLVED)
-- wasn't possible at all before — RLS never granted UPDATE on counseling_requests.
CREATE POLICY "Coordinators can update ticket status"
ON public.counseling_requests FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ASSOCIATE_COORDINATOR'));
