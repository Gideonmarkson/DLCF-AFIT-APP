-- Round: forum post Delete UI + "Assistant General Coordinator" split into
-- "Assistant General Coordinator 1" / "Assistant General Coordinator 2".
--
-- The forum_posts "top leadership can update/delete any post" RLS policies
-- (added for Pin, now also gating the new Delete-any-post UI) were keyed to
-- a hardcoded list of executive_office literal strings. Two problems:
--
-- 1. They only ever checked profiles.executive_office (the PRIMARY office),
--    never additional_offices. Someone holding General
--    Coordinator / Assistant General Coordinator / Secretarial Coordinator
--    as a SECOND portfolio (not their primary one) could never actually
--    pin or delete, even though the app's multi-portfolio design
--    (additional_offices, from an earlier round) intends that to work, and
--    even though the Pin button's own visibility check in the UI already
--    looks at both — so the button could show and then fail server-side.
--    Fixed by checking both columns here.
--
-- 2. 'Assistant General Coordinator' is being split into two picker
--    options, 'Assistant General Coordinator 1' and
--    'Assistant General Coordinator 2' (two separate people hold the
--    office). The OLD plain string is intentionally kept in this
--    allow-list — not removed — so any profile row still holding that
--    exact old value keeps its Pin/Delete access uninterrupted. Nobody's
--    access silently breaks the moment this migration runs; it only stops
--    being offered as a NEW selection in the picker (that's a front-end
--    change, not a database one).

DROP POLICY IF EXISTS "Authors and top leadership can update posts" ON public.forum_posts;
CREATE POLICY "Authors and top leadership can update posts"
ON public.forum_posts FOR UPDATE TO authenticated
USING (
  author_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND (
      p.executive_office = ANY (ARRAY[
        'General Coordinator',
        'Assistant General Coordinator',
        'Assistant General Coordinator 1',
        'Assistant General Coordinator 2',
        'Secretarial Coordinator'
      ])
      OR p.additional_offices && ARRAY[
        'General Coordinator',
        'Assistant General Coordinator',
        'Assistant General Coordinator 1',
        'Assistant General Coordinator 2',
        'Secretarial Coordinator'
      ]
    )
  )
);

DROP POLICY IF EXISTS "Authors and top leadership can delete posts" ON public.forum_posts;
CREATE POLICY "Authors and top leadership can delete posts"
ON public.forum_posts FOR DELETE TO authenticated
USING (
  author_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND (
      p.executive_office = ANY (ARRAY[
        'General Coordinator',
        'Assistant General Coordinator',
        'Assistant General Coordinator 1',
        'Assistant General Coordinator 2',
        'Secretarial Coordinator'
      ])
      OR p.additional_offices && ARRAY[
        'General Coordinator',
        'Assistant General Coordinator',
        'Assistant General Coordinator 1',
        'Assistant General Coordinator 2',
        'Secretarial Coordinator'
      ]
    )
  )
);
