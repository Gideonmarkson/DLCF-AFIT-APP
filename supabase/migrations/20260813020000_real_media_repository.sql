-- Real fellowship media repository
-- Persists media metadata in Postgres and files in Supabase Storage.

CREATE TABLE IF NOT EXISTS public.media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('FLYER', 'SERMON_AUDIO', 'SPECIAL_VIDEO')),
  speaker_or_unit TEXT NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  source_type TEXT NOT NULL DEFAULT 'UPLOAD'
    CHECK (source_type IN ('UPLOAD', 'YOUTUBE')),
  storage_path TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  download_count INTEGER NOT NULL DEFAULT 0 CHECK (download_count >= 0)
);

CREATE INDEX IF NOT EXISTS media_items_category_created_idx
  ON public.media_items(category, created_at DESC);

ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- Everyone signed in may read the fellowship media repository.
DROP POLICY IF EXISTS "media_items_select_authenticated" ON public.media_items;
CREATE POLICY "media_items_select_authenticated"
  ON public.media_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Match the role values already used by the current media page.
-- The UI currently treats these roles as the authorized media/secretarial
-- upload roles, so the database policy enforces the same restriction.
DROP POLICY IF EXISTS "media_items_insert_media_roles" ON public.media_items;
CREATE POLICY "media_items_insert_media_roles"
  ON public.media_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('SYSTEM_ADMINISTRATOR', 'ASSOCIATE_COORDINATOR', 'STUDENT_EXECUTIVE')
    )
  );

DROP POLICY IF EXISTS "media_items_update_media_roles" ON public.media_items;
CREATE POLICY "media_items_update_media_roles"
  ON public.media_items
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('SYSTEM_ADMINISTRATOR', 'ASSOCIATE_COORDINATOR', 'STUDENT_EXECUTIVE')
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('SYSTEM_ADMINISTRATOR', 'ASSOCIATE_COORDINATOR', 'STUDENT_EXECUTIVE')
    )
  );

DROP POLICY IF EXISTS "media_items_delete_media_roles" ON public.media_items;
CREATE POLICY "media_items_delete_media_roles"
  ON public.media_items
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('SYSTEM_ADMINISTRATOR', 'ASSOCIATE_COORDINATOR', 'STUDENT_EXECUTIVE')
    )
  );

-- Storage bucket for uploaded fellowship media.
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-files', 'media-files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "media_files_select_public" ON storage.objects;
CREATE POLICY "media_files_select_public"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'media-files');

DROP POLICY IF EXISTS "media_files_insert_media_roles" ON storage.objects;
CREATE POLICY "media_files_insert_media_roles"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media-files'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('SYSTEM_ADMINISTRATOR', 'ASSOCIATE_COORDINATOR', 'STUDENT_EXECUTIVE')
    )
  );

DROP POLICY IF EXISTS "media_files_update_media_roles" ON storage.objects;
CREATE POLICY "media_files_update_media_roles"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'media-files'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('SYSTEM_ADMINISTRATOR', 'ASSOCIATE_COORDINATOR', 'STUDENT_EXECUTIVE')
    )
  )
  WITH CHECK (
    bucket_id = 'media-files'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('SYSTEM_ADMINISTRATOR', 'ASSOCIATE_COORDINATOR', 'STUDENT_EXECUTIVE')
    )
  );

DROP POLICY IF EXISTS "media_files_delete_media_roles" ON storage.objects;
CREATE POLICY "media_files_delete_media_roles"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'media-files'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role::text IN ('SYSTEM_ADMINISTRATOR', 'ASSOCIATE_COORDINATOR', 'STUDENT_EXECUTIVE')
    )
  );

-- Avoid public write access to Storage: only the policy above can upload.
