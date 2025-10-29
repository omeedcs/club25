-- Fix RSVP RLS policies - they're conflicting

-- Drop all existing RSVP policies and recreate them properly
DROP POLICY IF EXISTS "Users can create RSVPs" ON public.rsvps CASCADE;
DROP POLICY IF EXISTS "Users can view own RSVPs" ON public.rsvps CASCADE;
DROP POLICY IF EXISTS "Anyone can view RSVP by confirmation code" ON public.rsvps CASCADE;
DROP POLICY IF EXISTS "Attendees can view other guests" ON public.rsvps CASCADE;

-- 1. Allow anyone to view RSVP by confirmation code (for /confirmation page)
CREATE POLICY "Anyone can view RSVP by confirmation code" ON public.rsvps
  FOR SELECT USING (confirmation_code IS NOT NULL);

-- 2. Allow users to create RSVPs
CREATE POLICY "Users can create RSVPs" ON public.rsvps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Allow users to view their own RSVPs
CREATE POLICY "Users can view own RSVPs" ON public.rsvps
  FOR SELECT USING (auth.uid() = user_id);

-- Success
DO $$
BEGIN
  RAISE NOTICE '✅ RSVP policies fixed!';
  RAISE NOTICE '🔄 Refresh the page';
END $$;
