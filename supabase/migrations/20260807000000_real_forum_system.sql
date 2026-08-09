-- Forums never had row-level security at all, and there was no way to
-- track "who already liked this post" — hence unlimited likes.

ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.forum_post_likes (
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (post_id, user_id)  -- the primary key itself is what makes a second like impossible
);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_likes ENABLE ROW LEVEL SECURITY;

-- Anyone logged in can read every post
CREATE POLICY "Forum posts are viewable by authenticated users"
ON public.forum_posts FOR SELECT TO authenticated USING (true);

-- Regular discussion posts: anyone can create one.
-- "Unit Notice" (is_announcement = true) posts: only Exco or Associate Coordinators.
CREATE POLICY "Post creation follows announcement rules"
ON public.forum_posts FOR INSERT TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND (
    is_announcement = false
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('STUDENT_EXECUTIVE', 'ASSOCIATE_COORDINATOR')
    )
  )
);

-- Authors can edit/delete their own post. Top-tier leadership (General
-- Coordinator, Asst GC, Secretarial Coordinator) can update/delete any post —
-- this is what actually lets them pin something, enforced server-side, not
-- just hidden in the UI.
CREATE POLICY "Authors and top leadership can update posts"
ON public.forum_posts FOR UPDATE TO authenticated
USING (
  author_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND executive_office IN ('General Coordinator', 'Assistant General Coordinator', 'Secretarial Coordinator')
  )
);

CREATE POLICY "Authors and top leadership can delete posts"
ON public.forum_posts FOR DELETE TO authenticated
USING (
  author_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND executive_office IN ('General Coordinator', 'Assistant General Coordinator', 'Secretarial Coordinator')
  )
);

-- Likes: anyone can see counts, can only like/unlike as themselves.
CREATE POLICY "Likes are viewable by authenticated users"
ON public.forum_post_likes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can like as themselves"
ON public.forum_post_likes FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike their own like"
ON public.forum_post_likes FOR DELETE TO authenticated
USING (user_id = auth.uid());
