-- Fix RLS policies to allow upserts and fix foreign key issues

-- 1. Fix guest_presence policies to allow UPSERT
DROP POLICY IF EXISTS "Users can update own presence" ON public.guest_presence CASCADE;
DROP POLICY IF EXISTS "Users can update own presence status" ON public.guest_presence CASCADE;
DROP POLICY IF EXISTS "Users can manage own presence" ON public.guest_presence CASCADE;

-- Allow users to insert/upsert their own presence
CREATE POLICY "Users can manage own presence" ON public.guest_presence
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Add policy for attendees to view other guests (for the guest list)
DROP POLICY IF EXISTS "Attendees can view other guests" ON public.rsvps;
CREATE POLICY "Attendees can view other guests" ON public.rsvps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rsvps my_rsvp
      WHERE my_rsvp.user_id = auth.uid()
      AND my_rsvp.drop_id = rsvps.drop_id
      AND my_rsvp.status = 'confirmed'
    )
  );

-- Success
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies fixed!';
  RAISE NOTICE '🔄 Refresh the experience page';
END $$;
