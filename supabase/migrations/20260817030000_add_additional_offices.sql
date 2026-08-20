-- Supports an Exco holding more than one portfolio at once.
--
-- executive_office stays as-is (still a single TEXT value) — it remains
-- the PRIMARY portfolio, and every existing permission check that does
-- `executive_office === 'Academic Director'` keeps working unchanged for
-- anyone who only ever holds one office.
--
-- additional_offices is new: an array of any EXTRA portfolios the same
-- person also holds (e.g. General Coordinator who is also Asst Choir
-- Master). Empty by default, so this is fully backward compatible —
-- nobody's existing data changes.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS additional_offices TEXT[] NOT NULL DEFAULT '{}';
