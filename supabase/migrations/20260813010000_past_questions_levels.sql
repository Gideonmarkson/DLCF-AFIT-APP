-- Add level targeting to past-question resources.
-- NULL means "All Levels" so existing uploads remain visible to everyone.
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS level TEXT;

CREATE INDEX IF NOT EXISTS resources_past_question_level_idx
  ON public.resources(level)
  WHERE category = 'PAST_QUESTION';
