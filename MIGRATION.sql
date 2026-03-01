-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- These columns are needed for intake completion and email notifications

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS disability_track text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS medically_fragile boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS medicaid_cmo text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS diagnosis text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_concern text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_email boolean DEFAULT true;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
