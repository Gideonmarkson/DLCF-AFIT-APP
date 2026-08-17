-- DLCF AFIT Fellowship Media: authoritative delete permissions.
-- Existing project structure uses public.media_items and storage bucket media-files.
-- Normalize media source types used by the current upload UI.
-- Keep the intended access rule exactly:
--   ASSOCIATE_COORDINATOR OR STUDENT_EXECUTIVE

-- The current media upload flow uses FILE for Supabase Storage uploads and
-- YOUTUBE for externally hosted YouTube recordings. Existing legacy values
-- are normalized before the check constraint is recreated.
ALTER TABLE public.media_items
  DROP CONSTRAINT IF EXISTS media_items_source_type_check;

UPDATE public.media_items
SET source_type = CASE
  WHEN LOWER(COALESCE(source_type, '')) IN (
    'youtube', 'youtube_link', 'youtube-url', 'youtube_url', 'link', 'external', 'url'
  ) THEN 'YOUTUBE'
  ELSE 'FILE'
END;

ALTER TABLE public.media_items
  ADD CONSTRAINT media_items_source_type_check
  CHECK (source_type IN ('FILE', 'YOUTUBE'));

ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

GRANT DELETE ON public.media_items TO authenticated;

DROP POLICY IF EXISTS "Authorized leadership can delete media_items"
ON public.media_items;

CREATE POLICY "Authorized leadership can delete media_items"
ON public.media_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('ASSOCIATE_COORDINATOR', 'STUDENT_EXECUTIVE')
  )
);

DROP POLICY IF EXISTS "Authorized leadership can delete media files"
ON storage.objects;

CREATE POLICY "Authorized leadership can delete media files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'media-files'
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('ASSOCIATE_COORDINATOR', 'STUDENT_EXECUTIVE')
  )
);
