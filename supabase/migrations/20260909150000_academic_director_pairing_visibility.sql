-- Allow the Academic Director to see all mentorship pairings so the UI can
-- list existing assignments and provide an explicit "Undo Pairing" action.
-- The existing pairing migration already restricts INSERT/UPDATE/DELETE to
-- the Academic Director office; this adds the missing SELECT path explicitly.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'mentor_pairings'
      AND policyname = 'Academic Director can view all pairings'
  ) THEN
    CREATE POLICY "Academic Director can view all pairings"
      ON public.mentor_pairings
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.executive_office = 'Academic Director'
        )
      );
  END IF;
END
$$;

-- Ensure the Academic Director still has an explicit DELETE path even when
-- the original pairing migration was only partially applied.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'mentor_pairings'
      AND policyname = 'Academic Director can undo pairings'
  ) THEN
    CREATE POLICY "Academic Director can undo pairings"
      ON public.mentor_pairings
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.executive_office = 'Academic Director'
        )
      );
  END IF;
END
$$;
