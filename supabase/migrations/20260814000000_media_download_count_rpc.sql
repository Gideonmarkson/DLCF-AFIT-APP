
CREATE OR REPLACE FUNCTION public.increment_media_download_count(p_media_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.media_items
  SET download_count = download_count + 1
  WHERE id = p_media_id
  RETURNING download_count INTO new_count;

  RETURN new_count;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_media_download_count(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_media_download_count(UUID) TO authenticated;
