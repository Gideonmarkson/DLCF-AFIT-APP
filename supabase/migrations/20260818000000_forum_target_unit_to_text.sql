-- forum_posts.target_unit was locked to a Postgres ENUM
-- (church_unit_type) created on day one with a fixed 9-value set:
-- CHOIR, PRAYER, USHERING, ACADEMICS, PUBLICITY, EVANGELISM,
-- TECHNICAL, SANCTUARY, NONE.
--
-- That list never matched FELLOWSHIP_UNITS (src/lib/constants.ts),
-- the real, current unit list used everywhere else in the app
-- (profile setup, etc.) — it was missing Media, Maintenance, Drama,
-- Organising, Follow-Up, and Sister Welfare, and included two units,
-- Technical and Sanctuary, that aren't part of the real taxonomy.
-- Because it's a closed enum, the UI could never offer a genuine
-- free-text "Other" fallback either — every new/renamed unit would
-- have needed its own migration forever.
--
-- Converting to plain TEXT fixes both problems: the picker can now
-- show the real unit list plus a manual "Other" entry, matching how
-- department and executive office already work.
--
-- USING target_unit::TEXT preserves every existing row's value
-- exactly as-is (Postgres enum values are just labels under the
-- hood, so the cast is lossless) — no data is renamed or lost. Old
-- posts tagged e.g. 'TECHNICAL' keep that exact text; only the
-- picker used to create NEW posts changes.
--
-- profiles.church_unit and the church_unit_type enum type itself are
-- intentionally left untouched — confirmed unused anywhere in the
-- current app code, so there's no reason to touch them here.
ALTER TABLE public.forum_posts
ALTER COLUMN target_unit TYPE TEXT USING target_unit::TEXT;

ALTER TABLE public.forum_posts
ALTER COLUMN target_unit SET DEFAULT 'NONE';
