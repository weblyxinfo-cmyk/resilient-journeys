-- Add 'individual_eft_reiki_offer' to the session_type enum.
--
-- The EFT & Reiki cards have been live on /booking since 2026-07-16, but the
-- enum value was never added. session_bookings.session_type is that enum, so
-- booking-create's insert failed with 22P02 (invalid input value for enum) and
-- the client got a 500 — the offer has never been bookable.
--
-- Additive and idempotent; no existing rows are touched.

ALTER TYPE public.session_type ADD VALUE IF NOT EXISTS 'individual_eft_reiki_offer';
