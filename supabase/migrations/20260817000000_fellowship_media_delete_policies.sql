-- DLCF AFIT Fellowship Media: authoritative delete permissions.
-- Existing project structure uses public.media_items and storage bucket media-files.
-- Keep the intended access rule exactly:
--   ASSOCIATE_COORDINATOR OR STUDENT_EXECUTIVE

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
