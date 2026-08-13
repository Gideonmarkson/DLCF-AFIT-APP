-- Academic Secretary result verification
CREATE OR REPLACE FUNCTION public.set_result_verification(
  p_result_id UUID,
  p_verified BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'STUDENT_EXECUTIVE'
      AND executive_office = 'Academic Director'
  ) THEN
    RAISE EXCEPTION 'Only the Academic Director can verify academic results';
  END IF;

  UPDATE public.student_results
  SET is_verified = p_verified
  WHERE id = p_result_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.set_result_verification(UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_result_verification(UUID, BOOLEAN) TO authenticated;
