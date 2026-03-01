-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- These columns are needed for intake completion and email notifications

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS disability_track text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS medically_fragile boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS medicaid_cmo text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS diagnosis text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_concern text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_email boolean DEFAULT true;

-- Household income & size for eligibility tagging
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS household_income text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS household_size integer;

-- Enhanced onboarding fields for smarter program routing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS relationship text;         -- 'parent' | 'self' | 'guardian' | 'other'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_medicaid boolean;      -- direct yes/no for prerequisite checks
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS citizenship_status text;   -- 'citizen' | 'permanent_resident' | 'other'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS living_situation text;     -- 'home' | 'group_home' | 'nursing_facility' | 'independent'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employment_status text;    -- 'employed' | 'seeking' | 'not_working'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS waiver_waitlist text;      -- 'now' | 'comp' | 'both' | 'none' | null

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
