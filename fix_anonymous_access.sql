-- Allow anonymous access to experience features via confirmation code
-- This is needed because /experience/[code] doesn't require login

-- 1. Drop phases - allow anyone to view (they need confirmation code to know drop_id anyway)
DROP POLICY IF EXISTS "Attendees can view drop phases" ON public.drop_phases CASCADE;
CREATE POLICY "Anyone can view drop phases" ON public.drop_phases
  FOR SELECT USING (true);

-- 2. Kitchen updates - allow anyone to view
DROP POLICY IF EXISTS "Attendees can view kitchen updates" ON public.kitchen_updates CASCADE;
CREATE POLICY "Anyone can view kitchen updates" ON public.kitchen_updates
  FOR SELECT USING (true);

-- 3. Guest messages - allow anyone to view and insert
DROP POLICY IF EXISTS "Attendees can view messages" ON public.guest_messages CASCADE;
DROP POLICY IF EXISTS "Attendees can send messages" ON public.guest_messages CASCADE;
CREATE POLICY "Anyone can view messages" ON public.guest_messages
  FOR SELECT USING (true);
CREATE POLICY "Anyone can send messages" ON public.guest_messages
  FOR INSERT WITH CHECK (true);

-- 4. Guest prompts - allow anyone to view
DROP POLICY IF EXISTS "Users can view own prompts" ON public.guest_prompts CASCADE;
CREATE POLICY "Anyone can view prompts" ON public.guest_prompts
  FOR SELECT USING (true);

-- 5. Guest presence - allow anyone to manage
DROP POLICY IF EXISTS "Attendees can view presence" ON public.guest_presence CASCADE;
DROP POLICY IF EXISTS "Users can manage own presence" ON public.guest_presence CASCADE;
CREATE POLICY "Anyone can view presence" ON public.guest_presence
  FOR SELECT USING (true);
CREATE POLICY "Anyone can manage presence" ON public.guest_presence
  FOR ALL USING (true) WITH CHECK (true);

-- 6. Personality matches - allow anyone to view
DROP POLICY IF EXISTS "Users can view own matches" ON public.personality_matches CASCADE;
CREATE POLICY "Anyone can view matches" ON public.personality_matches
  FOR SELECT USING (true);

-- Success!
DO $$
BEGIN
  RAISE NOTICE '✅ Anonymous access enabled!';
  RAISE NOTICE '🔄 Refresh the experience page - it should work now!';
END $$;
