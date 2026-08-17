-- Persistent per-user likes for the DLCF AFIT fellowship media repository.
-- One user can like a media item at most once.

CREATE TABLE IF NOT EXISTS public.media_likes (
  media_id UUID NOT NULL REFERENCES public.media_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (media_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_media_likes_user_id
  ON public.media_likes(user_id);

ALTER TABLE public.media_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own media likes"
ON public.media_likes;

CREATE POLICY "Users can view their own media likes"
ON public.media_likes
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can add their own media likes"
ON public.media_likes;

CREATE POLICY "Users can add their own media likes"
ON public.media_likes
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can remove their own media likes"
ON public.media_likes;

CREATE POLICY "Users can remove their own media likes"
ON public.media_likes
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
