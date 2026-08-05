-- Tenure/session for Exco and Coordinator positions, e.g. "2025/2026"
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenure_session TEXT;

-- Real avatar storage: a public bucket, one file per user, they can only
-- write/replace/delete their own — same "no one else can touch it" pattern
-- as everything else in this schema.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Let users set their own avatar_url once the file's uploaded (already granted
-- for full_name/phone_number/etc — this just adds avatar_url to that same list).
GRANT UPDATE (avatar_url) ON public.profiles TO authenticated;
