-- QUICK SETUP: Run this in Supabase SQL Editor
-- This creates tables + seeds test data for the immersive experience

-- 1. CREATE TABLES (from migration)

-- Drop Phases (tracks current phase of the event in real-time)
CREATE TABLE IF NOT EXISTS public.drop_phases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  drop_id UUID REFERENCES public.drops(id) NOT NULL UNIQUE,
  current_phase TEXT NOT NULL DEFAULT 'arrival' 
    CHECK (current_phase IN ('arrival', 'appetizer', 'main', 'dessert', 'conclusion')),
  phase_started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kitchen Updates (live updates from kitchen)
CREATE TABLE IF NOT EXISTS public.kitchen_updates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  drop_id UUID REFERENCES public.drops(id) NOT NULL,
  message TEXT NOT NULL,
  course TEXT CHECK (course IN ('arrival', 'appetizer', 'main', 'dessert')),
  image_url TEXT,
  posted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guest Messages (live communication between guests)
CREATE TABLE IF NOT EXISTS public.guest_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  drop_id UUID REFERENCES public.drops(id) NOT NULL,
  from_user_id UUID REFERENCES auth.users(id) NOT NULL,
  to_user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'reaction', 'toast')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guest Assigned Prompts (personalized prompts per guest)
CREATE TABLE IF NOT EXISTS public.guest_prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  drop_id UUID REFERENCES public.drops(id) NOT NULL,
  prompt_id UUID REFERENCES public.prompts(id) NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  revealed BOOLEAN DEFAULT false,
  UNIQUE(user_id, drop_id, prompt_id)
);

-- Guest Personalities (AI-analyzed personality traits)
CREATE TABLE IF NOT EXISTS public.guest_personalities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  traits JSONB,
  interests TEXT[],
  conversation_style TEXT,
  energy_level TEXT CHECK (energy_level IN ('quiet', 'balanced', 'energetic')),
  openness_score DECIMAL,
  last_analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personality Matches (AI-suggested guest connections)
CREATE TABLE IF NOT EXISTS public.personality_matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  drop_id UUID REFERENCES public.drops(id) NOT NULL,
  user_id_1 UUID REFERENCES auth.users(id) NOT NULL,
  user_id_2 UUID REFERENCES auth.users(id) NOT NULL,
  match_score DECIMAL NOT NULL,
  match_reasons TEXT[],
  revealed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(drop_id, user_id_1, user_id_2)
);

-- Guest Presence (tracks who's currently active in the experience)
CREATE TABLE IF NOT EXISTS public.guest_presence (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  drop_id UUID REFERENCES public.drops(id) NOT NULL,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  device_id TEXT,
  UNIQUE(user_id, drop_id)
);

-- 2. ENABLE RLS
ALTER TABLE public.drop_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_personalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_presence ENABLE ROW LEVEL SECURITY;

-- 3. CREATE RLS POLICIES

-- Drop Phases
DROP POLICY IF EXISTS "Attendees can view drop phases" ON public.drop_phases;
CREATE POLICY "Attendees can view drop phases" ON public.drop_phases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.checkins
      WHERE checkins.drop_id = drop_phases.drop_id
      AND checkins.user_id = auth.uid()
    )
  );

-- Kitchen Updates
DROP POLICY IF EXISTS "Attendees can view kitchen updates" ON public.kitchen_updates;
CREATE POLICY "Attendees can view kitchen updates" ON public.kitchen_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.checkins
      WHERE checkins.drop_id = kitchen_updates.drop_id
      AND checkins.user_id = auth.uid()
    )
  );

-- Guest Messages
DROP POLICY IF EXISTS "Attendees can view messages" ON public.guest_messages;
CREATE POLICY "Attendees can view messages" ON public.guest_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.checkins
      WHERE checkins.drop_id = guest_messages.drop_id
      AND checkins.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Attendees can send messages" ON public.guest_messages;
CREATE POLICY "Attendees can send messages" ON public.guest_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.checkins
      WHERE checkins.drop_id = drop_id
      AND checkins.user_id = auth.uid()
    )
    AND from_user_id = auth.uid()
  );

-- Guest Prompts
DROP POLICY IF EXISTS "Users can view own prompts" ON public.guest_prompts;
CREATE POLICY "Users can view own prompts" ON public.guest_prompts
  FOR SELECT USING (auth.uid() = user_id);

-- Guest Personalities
DROP POLICY IF EXISTS "Users can view own personality" ON public.guest_personalities;
CREATE POLICY "Users can view own personality" ON public.guest_personalities
  FOR SELECT USING (auth.uid() = user_id);

-- Personality Matches
DROP POLICY IF EXISTS "Users can view own matches" ON public.personality_matches;
CREATE POLICY "Users can view own matches" ON public.personality_matches
  FOR SELECT USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Guest Presence
DROP POLICY IF EXISTS "Attendees can view presence" ON public.guest_presence;
CREATE POLICY "Attendees can view presence" ON public.guest_presence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.checkins
      WHERE checkins.drop_id = guest_presence.drop_id
      AND checkins.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own presence" ON public.guest_presence;
CREATE POLICY "Users can update own presence" ON public.guest_presence
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own presence status" ON public.guest_presence;
CREATE POLICY "Users can update own presence status" ON public.guest_presence
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_kitchen_updates_drop_id ON public.kitchen_updates(drop_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_updates_created_at ON public.kitchen_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guest_messages_drop_id ON public.guest_messages(drop_id);
CREATE INDEX IF NOT EXISTS idx_guest_messages_created_at ON public.guest_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guest_prompts_user_drop ON public.guest_prompts(user_id, drop_id);
CREATE INDEX IF NOT EXISTS idx_personality_matches_drop_id ON public.personality_matches(drop_id);
CREATE INDEX IF NOT EXISTS idx_guest_presence_drop_active ON public.guest_presence(drop_id, is_active);

-- 5. CREATE TRIGGERS
DROP TRIGGER IF EXISTS update_drop_phases_updated_at ON public.drop_phases;
CREATE TRIGGER update_drop_phases_updated_at
  BEFORE UPDATE ON public.drop_phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_guest_personalities_updated_at ON public.guest_personalities;
CREATE TRIGGER update_guest_personalities_updated_at
  BEFORE UPDATE ON public.guest_personalities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. SEED TEST DATA

-- Set current phase for announced drops
INSERT INTO drop_phases (drop_id, current_phase)
SELECT id, 'arrival'
FROM drops
WHERE status = 'announced'
ON CONFLICT (drop_id) DO UPDATE
SET current_phase = 'arrival';

-- Add sample kitchen update
INSERT INTO kitchen_updates (drop_id, message, course)
SELECT 
  id,
  'Welcome! We''re preparing something special for tonight 🍽️',
  'arrival'
FROM drops 
WHERE status = 'announced'
ON CONFLICT DO NOTHING;

-- Add another kitchen update
INSERT INTO kitchen_updates (drop_id, message, course)
SELECT 
  id,
  'Starting to plate the first course... get ready! ✨',
  'appetizer'
FROM drops 
WHERE status = 'announced'
ON CONFLICT DO NOTHING;

-- Add sample prompts (global, so they work for any drop)
INSERT INTO prompts (drop_id, text, phase, weight, active) VALUES
  (NULL, 'What meal changed your life?', 'arrival', 1.0, true),
  (NULL, 'If you could taste any moment in history, which would it be?', 'arrival', 1.0, true),
  (NULL, 'What''s your earliest food memory?', 'appetizer', 1.0, true),
  (NULL, 'Describe the perfect meal using only three words.', 'appetizer', 1.0, true),
  (NULL, 'What flavor reminds you of home?', 'main', 1.0, true),
  (NULL, 'If you could have dinner with anyone, dead or alive, who and where?', 'main', 1.0, true),
  (NULL, 'What''s the most adventurous thing you''ve ever eaten?', 'dessert', 1.0, true),
  (NULL, 'Describe your ideal last meal.', 'dessert', 1.0, true)
ON CONFLICT DO NOTHING;

-- Manually assign prompts to existing RSVPs (since trigger only fires on new check-ins)
-- Assign all prompts to each confirmed guest
INSERT INTO guest_prompts (user_id, drop_id, prompt_id)
SELECT 
  r.user_id,
  r.drop_id,
  p.id
FROM rsvps r
CROSS JOIN prompts p
WHERE r.status = 'confirmed'
  AND p.active = true
ON CONFLICT (user_id, drop_id, prompt_id) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration complete! Tables created and test data seeded.';
  RAISE NOTICE '🎭 Refresh your experience page to see the new features!';
END $$;
