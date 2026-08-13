-- Forum comments were created in the original schema but were never
-- protected by RLS and had no usable UI. Add the missing policies and
-- supporting index now.

ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_forum_comments_post_created
  ON public.forum_comments(post_id, created_at);

DROP POLICY IF EXISTS "Forum comments are viewable by authenticated users"
  ON public.forum_comments;

CREATE POLICY "Forum comments are viewable by authenticated users"
  ON public.forum_comments
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create their own forum comments"
  ON public.forum_comments;

CREATE POLICY "Users can create their own forum comments"
  ON public.forum_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors and top leadership can update forum comments"
  ON public.forum_comments;

CREATE POLICY "Authors and top leadership can update forum comments"
  ON public.forum_comments
  FOR UPDATE
  TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND executive_office IN (
          'General Coordinator',
          'Assistant General Coordinator',
          'Secretarial Coordinator'
        )
    )
  )
  WITH CHECK (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND executive_office IN (
          'General Coordinator',
          'Assistant General Coordinator',
          'Secretarial Coordinator'
        )
    )
  );

DROP POLICY IF EXISTS "Authors and top leadership can delete forum comments"
  ON public.forum_comments;

CREATE POLICY "Authors and top leadership can delete forum comments"
  ON public.forum_comments
  FOR DELETE
  TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND executive_office IN (
          'General Coordinator',
          'Assistant General Coordinator',
          'Secretarial Coordinator'
        )
    )
  );
