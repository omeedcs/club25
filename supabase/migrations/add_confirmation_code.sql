-- Add confirmation_code column to existing rsvps table
ALTER TABLE public.rsvps 
ADD COLUMN IF NOT EXISTS confirmation_code TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rsvps_confirmation_code 
ON public.rsvps(confirmation_code);

-- Update existing RSVPs with confirmation codes
-- (Run this manually if you have existing data)
-- UPDATE public.rsvps 
-- SET confirmation_code = 'C25-' || upper(substring(md5(random()::text) from 1 for 4)) || '-' || upper(substring(md5(random()::text) from 1 for 4))
-- WHERE confirmation_code IS NULL;
