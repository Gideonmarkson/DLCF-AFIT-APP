-- Persist campus residence / hostel in the user's profile.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS residence TEXT;
