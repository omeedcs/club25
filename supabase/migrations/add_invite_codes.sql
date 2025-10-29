-- Create invite codes table
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  max_uses INTEGER DEFAULT 3,
  current_uses INTEGER DEFAULT 0,
  source TEXT DEFAULT 'attendee' CHECK (source IN ('attendee', 'admin', 'founder')),
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add invite tracking to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS invited_by_code TEXT,
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Add invite tracking to RSVPs
ALTER TABLE public.rsvps 
  ADD COLUMN IF NOT EXISTS used_invite_code TEXT;

-- Enable RLS
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Policies for invite codes
CREATE POLICY "Users can view their own invite codes" ON public.invite_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can validate invite codes" ON public.invite_codes
  FOR SELECT USING (active = true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_user_id ON public.invite_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_invite_codes_active ON public.invite_codes(active);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate code like "CLUB-A7X2"
    code := 'CLUB-' || 
            substring(md5(random()::text) from 1 for 2) || 
            substring(upper(md5(random()::text)) from 1 for 2);
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.invite_codes WHERE invite_codes.code = code) INTO exists;
    
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
