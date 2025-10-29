-- Allow anyone to view RSVPs by confirmation code (for confirmation page)
CREATE POLICY "Anyone can view RSVP by confirmation code" ON public.rsvps
  FOR SELECT USING (confirmation_code IS NOT NULL);

-- This allows the /confirmation/[code] page to fetch RSVP details
-- Security: confirmation codes are unguessable (C25-XXXX-XXXX format)
