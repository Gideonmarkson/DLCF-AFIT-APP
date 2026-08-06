-- Multiple fellowship units per person (Academics + Media + Choir etc),
-- separate from the single church_unit enum which doesn't support that.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fellowship_units TEXT[] DEFAULT '{}';

GRANT UPDATE (fellowship_units) ON public.profiles TO authenticated;
