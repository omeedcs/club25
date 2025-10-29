-- Add immersive experience features

-- Drop Phases (tracks current phase of the event in real-time)
CREATE TABLE public.drop_phases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  drop_id UUID REFERENCES public.drops(id) NOT NULL UNIQUE,
  current_phase TEXT NOT NULL DEFAULT 'arrival' 
    CHECK (current_phase IN ('arrival', 'appetizer', 'main', 'dessert', 'conclusion')),
  phase_started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kitchen Updates (live updates from kitchen)
CREATE TABLE public.kitchen_updates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  drop_id UUID REFERENCES public.drops(id) NOT NULL,
  message TEXT NOT NULL,
  course TEXT CHECK (course IN ('arrival', 'appetizer', 'main', 'dessert')),
  image_url TEXT,
  posted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guest Messages (live communication between guests)
CREATE TABLE public.guest_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  drop_id UUID REFERENCES public.drops(id) NOT NULL,
  from_user_id UUID REFERENCES auth.users(id) NOT NULL,
  to_user_id UUID REFERENCES auth.users(id), -- NULL means message to all
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'reaction', 'toast')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guest Assigned Prompts (personalized prompts per guest)
CREATE TABLE public.guest_prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  drop_id UUID REFERENCES public.drops(id) NOT NULL,
  prompt_id UUID REFERENCES public.prompts(id) NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  revealed BOOLEAN DEFAULT false,
  UNIQUE(user_id, drop_id, prompt_id)
);

-- Guest Personalities (AI-analyzed personality traits)
CREATE TABLE public.guest_personalities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  traits JSONB, -- stores personality analysis
  interests TEXT[],
  conversation_style TEXT,
  energy_level TEXT CHECK (energy_level IN ('quiet', 'balanced', 'energetic')),
  openness_score DECIMAL,
  last_analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personality Matches (AI-suggested guest connections)
CREATE TABLE public.personality_matches (
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
CREATE TABLE public.guest_presence (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  drop_id UUID REFERENCES public.drops(id) NOT NULL,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  device_id TEXT,
  UNIQUE(user_id, drop_id)
);

-- Enable RLS
ALTER TABLE public.drop_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_personalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Drop Phases (attendees can view current phase)
CREATE POLICY "Attendees can view drop phases" ON public.drop_phases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.checkins
      WHERE checkins.drop_id = drop_phases.drop_id
      AND checkins.user_id = auth.uid()
    )
  );

-- Kitchen Updates (attendees can view)
CREATE POLICY "Attendees can view kitchen updates" ON public.kitchen_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.checkins
      WHERE checkins.drop_id = kitchen_updates.drop_id
      AND checkins.user_id = auth.uid()
    )
  );

-- Guest Messages (attendees can send and view)
CREATE POLICY "Attendees can view messages" ON public.guest_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.checkins
      WHERE checkins.drop_id = guest_messages.drop_id
      AND checkins.user_id = auth.uid()
    )
  );

CREATE POLICY "Attendees can send messages" ON public.guest_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.checkins
      WHERE checkins.drop_id = drop_id
      AND checkins.user_id = auth.uid()
    )
    AND from_user_id = auth.uid()
  );

-- Guest Prompts (users can view their own prompts)
CREATE POLICY "Users can view own prompts" ON public.guest_prompts
  FOR SELECT USING (auth.uid() = user_id);

-- Guest Personalities (users can view own personality)
CREATE POLICY "Users can view own personality" ON public.guest_personalities
  FOR SELECT USING (auth.uid() = user_id);

-- Personality Matches (users can view their matches)
CREATE POLICY "Users can view own matches" ON public.personality_matches
  FOR SELECT USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Guest Presence (attendees can view and update)
CREATE POLICY "Attendees can view presence" ON public.guest_presence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.checkins
      WHERE checkins.drop_id = guest_presence.drop_id
      AND checkins.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own presence" ON public.guest_presence
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presence status" ON public.guest_presence
  FOR UPDATE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_kitchen_updates_drop_id ON public.kitchen_updates(drop_id);
CREATE INDEX idx_kitchen_updates_created_at ON public.kitchen_updates(created_at DESC);
CREATE INDEX idx_guest_messages_drop_id ON public.guest_messages(drop_id);
CREATE INDEX idx_guest_messages_created_at ON public.guest_messages(created_at DESC);
CREATE INDEX idx_guest_prompts_user_drop ON public.guest_prompts(user_id, drop_id);
CREATE INDEX idx_personality_matches_drop_id ON public.personality_matches(drop_id);
CREATE INDEX idx_guest_presence_drop_active ON public.guest_presence(drop_id, is_active);

-- Triggers
CREATE TRIGGER update_drop_phases_updated_at
  BEFORE UPDATE ON public.drop_phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_guest_personalities_updated_at
  BEFORE UPDATE ON public.guest_personalities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to auto-assign prompts when guest checks in
CREATE OR REPLACE FUNCTION assign_prompts_on_checkin()
RETURNS TRIGGER AS $$
BEGIN
  -- Assign 3 random prompts for each phase
  INSERT INTO public.guest_prompts (user_id, drop_id, prompt_id)
  SELECT 
    NEW.user_id,
    NEW.drop_id,
    id
  FROM public.prompts
  WHERE drop_id = NEW.drop_id OR drop_id IS NULL
  ORDER BY RANDOM()
  LIMIT 12;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assign_prompts_after_checkin
  AFTER INSERT ON public.checkins
  FOR EACH ROW EXECUTE FUNCTION assign_prompts_on_checkin();
