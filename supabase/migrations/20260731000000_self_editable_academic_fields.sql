-- Let a user edit their own personal/academic info (name, phone, cgpa, level,
-- department, matric number, church unit) without touching role or
-- executive_office, which stay server-only (set only via the passcode-verified
-- server routes, never by a direct client-side update).
GRANT UPDATE (
  full_name,
  phone_number,
  avatar_url,
  cgpa,
  current_level,
  department,
  matric_number,
  church_unit
) ON public.profiles TO authenticated;
