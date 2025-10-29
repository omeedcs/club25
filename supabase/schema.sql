-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drops (events)
CREATE TABLE public.drops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  date_time TIMESTAMPTZ NOT NULL,
  seat_limit INTEGER NOT NULL DEFAULT 12,
  description TEXT,
  short_copy TEXT,
  status TEXT NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft', 'announced', 'sold_out', 'completed', 'cancelled')),
  hero_image_url TEXT,
  menu_items JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RSVPs
CREATE TABLE public.rsvps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  drop_id UUID REFERENCES public.drops(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested' 
    CHECK (status IN ('requested', 'confirmed', 'waitlist', 'cancelled')),
  dietary_notes TEXT,
  confirmation_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, drop_id)
);

-- Check-ins
CREATE TABLE public.checkins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  drop_id UUID REFERENCES public.drops(id) NOT NULL,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  qr_code TEXT,
  UNIQUE(user_id, drop_id)
);

-- Receipts (digital mementos)
CREATE TABLE public.receipts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  drop_id UUID REFERENCES public.drops(id) NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, drop_id)
);

-- Media (photos/videos from events)
CREATE TABLE public.media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  drop_id UUID REFERENCES public.drops(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  approved BOOLEAN DEFAULT false,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prompts (conversation starters)
CREATE TABLE public.prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  drop_id UUID REFERENCES public.drops(id),
  text TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('arrival', 'appetizer', 'main', 'dessert')),
  weight DECIMAL DEFAULT 1.0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Keys (membership tiers)
CREATE TABLE public.keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  drops_attended INTEGER NOT NULL DEFAULT 0,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waitlist notifications
CREATE TABLE public.waitlist_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rsvp_id UUID REFERENCES public.rsvps(id) NOT NULL,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_notifications ENABLE ROW LEVEL SECURITY;

-- Policies

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Drops (public read for announced)
CREATE POLICY "Anyone can view announced drops" ON public.drops
  FOR SELECT USING (status IN ('announced', 'sold_out', 'completed'));

-- RSVPs
CREATE POLICY "Users can create RSVPs" ON public.rsvps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own RSVPs" ON public.rsvps
  FOR SELECT USING (auth.uid() = user_id);

-- Checkins
CREATE POLICY "Users can view own checkins" ON public.checkins
  FOR SELECT USING (auth.uid() = user_id);

-- Receipts
CREATE POLICY "Users can view own receipts" ON public.receipts
  FOR SELECT USING (auth.uid() = user_id);

-- Media
CREATE POLICY "Users can view approved media" ON public.media
  FOR SELECT USING (approved = true OR user_id = auth.uid());

CREATE POLICY "Attendees can upload media" ON public.media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.checkins
      WHERE checkins.user_id = auth.uid()
      AND checkins.drop_id = media.drop_id
    )
  );

-- Keys
CREATE POLICY "Users can view own keys" ON public.keys
  FOR SELECT USING (auth.uid() = user_id);

-- Prompts (public read for active)
CREATE POLICY "Anyone can view active prompts" ON public.prompts
  FOR SELECT USING (active = true);

-- Indexes
CREATE INDEX idx_rsvps_drop_id ON public.rsvps(drop_id);
CREATE INDEX idx_rsvps_user_id ON public.rsvps(user_id);
CREATE INDEX idx_rsvps_status ON public.rsvps(status);
CREATE INDEX idx_checkins_drop_id ON public.checkins(drop_id);
CREATE INDEX idx_media_drop_id ON public.media(drop_id);
CREATE INDEX idx_media_approved ON public.media(approved);
CREATE INDEX idx_receipts_user_id ON public.receipts(user_id);
CREATE INDEX idx_drops_status ON public.drops(status);
CREATE INDEX idx_drops_date_time ON public.drops(date_time);

-- Functions

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_drops_updated_at
  BEFORE UPDATE ON public.drops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_rsvps_updated_at
  BEFORE UPDATE ON public.rsvps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_keys_updated_at
  BEFORE UPDATE ON public.keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
