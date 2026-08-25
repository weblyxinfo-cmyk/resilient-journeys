-- Block part of a day, not only the whole day.
--
-- "I am at the doctor on 5 September from 8 to 12" previously meant closing
-- the entire 5th, including the afternoon that was actually free.
--
-- Both times NULL keeps the old meaning — the whole day is blocked — so every
-- row that already exists goes on behaving exactly as before.

ALTER TABLE public.blocked_dates
  ADD COLUMN IF NOT EXISTS start_time TIME,
  ADD COLUMN IF NOT EXISTS end_time TIME;

-- Either both times are set and form a real window, or neither is: a row with
-- only one half of a window has no sensible meaning.
ALTER TABLE public.blocked_dates
  DROP CONSTRAINT IF EXISTS blocked_dates_time_window_check;
ALTER TABLE public.blocked_dates
  ADD CONSTRAINT blocked_dates_time_window_check CHECK (
    (start_time IS NULL AND end_time IS NULL)
    OR (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
  );

-- One day can now carry several windows (morning at the doctor, afternoon
-- elsewhere), so the day itself is no longer unique.
ALTER TABLE public.blocked_dates
  DROP CONSTRAINT IF EXISTS blocked_dates_date_key;

-- The same window must not be entered twice for the same day. NULLs compare as
-- distinct in a plain unique index, which would let two whole-day rows through,
-- so the times are folded to fixed values first.
CREATE UNIQUE INDEX IF NOT EXISTS blocked_dates_date_window_key
  ON public.blocked_dates (
    date,
    COALESCE(start_time, TIME '00:00'),
    COALESCE(end_time, TIME '23:59:59')
  );

COMMENT ON COLUMN public.blocked_dates.start_time IS
  'Start of the blocked window. NULL together with end_time means the whole day.';
COMMENT ON COLUMN public.blocked_dates.end_time IS
  'End of the blocked window, exclusive of a session that would overlap it.';
