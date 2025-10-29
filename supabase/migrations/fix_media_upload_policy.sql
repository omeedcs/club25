-- Fix media upload policy to allow confirmed RSVP guests to upload
-- (not just checked-in guests)

DROP POLICY IF EXISTS "Attendees can upload media" ON public.media;

CREATE POLICY "Confirmed guests can upload media" ON public.media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rsvps
      WHERE rsvps.user_id = auth.uid()
      AND rsvps.drop_id = media.drop_id
      AND rsvps.status = 'confirmed'
    )
  );
