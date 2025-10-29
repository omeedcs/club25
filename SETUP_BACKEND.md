# Setting Up Club25 Backend

Step-by-step guide to add the API layer to your Next.js site.

## 🎯 Goal

Transform the static site into a full application with:
- User authentication
- RSVP management
- QR check-in system
- Photo galleries
- Real-time features

---

## Option 1: Supabase (Recommended for Speed)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Save your:
   - Project URL
   - Anon public key
   - Service role key (keep secret!)

### Step 2: Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install --save-dev @supabase/supabase-js
```

### Step 3: Configure Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Add to `.gitignore`:
```
.env*.local
```

### Step 4: Create Supabase Client

Create `lib/supabase/client.ts`:

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// For client components
export const supabase = createClientComponentClient()

// For server actions/API routes (with service role)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

### Step 5: Run Database Migrations

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drops (events)
CREATE TABLE public.drops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  seat_limit INTEGER NOT NULL DEFAULT 12,
  description TEXT,
  short_copy TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'announced', 'sold_out', 'completed')),
  hero_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RSVPs
CREATE TABLE public.rsvps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  drop_id UUID REFERENCES public.drops(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'waitlist', 'cancelled')),
  dietary_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, drop_id)
);

-- Check-ins
CREATE TABLE public.checkins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  drop_id UUID REFERENCES public.drops(id) NOT NULL,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_hash TEXT,
  UNIQUE(user_id, drop_id)
);

-- Prompts
CREATE TABLE public.prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  drop_id UUID REFERENCES public.drops(id), -- NULL = global
  text TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('arrival', 'appetizer', 'main', 'dessert')),
  weight DECIMAL DEFAULT 1.0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media (photos/videos)
CREATE TABLE public.media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  drop_id UUID REFERENCES public.drops(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id), -- NULL = host
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receipts
CREATE TABLE public.receipts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  drop_id UUID REFERENCES public.drops(id) NOT NULL,
  code TEXT UNIQUE NOT NULL,
  nft_tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, drop_id)
);

-- Keys (membership)
CREATE TABLE public.keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  drops_attended INTEGER NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: users can read their own
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Drops: anyone can read announced drops
CREATE POLICY "Anyone can view announced drops" ON public.drops
  FOR SELECT USING (status = 'announced' OR status = 'sold_out');

-- RSVPs: users can create their own, read their own
CREATE POLICY "Users can create RSVPs" ON public.rsvps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own RSVPs" ON public.rsvps
  FOR SELECT USING (auth.uid() = user_id);

-- Checkins: users can read their own
CREATE POLICY "Users can view own checkins" ON public.checkins
  FOR SELECT USING (auth.uid() = user_id);

-- Media: users can read approved media for drops they attended
CREATE POLICY "Users can view approved media" ON public.media
  FOR SELECT USING (
    approved = true OR user_id = auth.uid()
  );

-- Receipts: users can view their own
CREATE POLICY "Users can view own receipts" ON public.receipts
  FOR SELECT USING (auth.uid() = user_id);

-- Keys: users can view their own
CREATE POLICY "Users can view own keys" ON public.keys
  FOR SELECT USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_rsvps_drop_id ON public.rsvps(drop_id);
CREATE INDEX idx_rsvps_user_id ON public.rsvps(user_id);
CREATE INDEX idx_checkins_drop_id ON public.checkins(drop_id);
CREATE INDEX idx_media_drop_id ON public.media(drop_id);
CREATE INDEX idx_receipts_user_id ON public.receipts(user_id);
```

Run in Supabase SQL Editor or via CLI:
```bash
npx supabase db push
```

### Step 6: Seed Sample Data

Create `supabase/seed.sql`:

```sql
-- Insert sample drop
INSERT INTO public.drops (slug, title, date_time, seat_limit, description, short_copy, status)
VALUES (
  'tokyo-midnight',
  'Tokyo Midnight',
  '2024-11-15 19:00:00+00',
  12,
  'izakaya energy meets dim jazz. sake flows like conversation. the city hums outside, but inside — only whispers and smoke.',
  'An evening in the spirit of Tokyo''s late-night izakayas',
  'announced'
);

-- Insert sample prompts
INSERT INTO public.prompts (drop_id, text, phase, weight)
VALUES
  ((SELECT id FROM public.drops WHERE slug = 'tokyo-midnight'), 
   'What meal changed your life?', 
   'appetizer', 
   1.0),
  ((SELECT id FROM public.drops WHERE slug = 'tokyo-midnight'), 
   'Describe your happiest accident.', 
   'main', 
   0.9),
  ((SELECT id FROM public.drops WHERE slug = 'tokyo-midnight'), 
   'What story will you tell about tonight?', 
   'dessert', 
   1.0);
```

---

## Step 7: Create API Routes

### RSVP Endpoint

Create `app/api/rsvp/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const { dropSlug, name, email, phone, dietaryNotes } = await request.json()

    // Get drop
    const { data: drop } = await supabaseAdmin
      .from('drops')
      .select('id, seat_limit, status')
      .eq('slug', dropSlug)
      .single()

    if (!drop || drop.status !== 'announced') {
      return NextResponse.json({ error: 'Drop not available' }, { status: 400 })
    }

    // Check capacity
    const { count } = await supabaseAdmin
      .from('rsvps')
      .select('*', { count: 'exact', head: true })
      .eq('drop_id', drop.id)
      .eq('status', 'confirmed')

    const status = (count || 0) < drop.seat_limit ? 'requested' : 'waitlist'

    // Create or get user
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    let userId = existingUser?.id

    if (!userId) {
      // Create auth user
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
      })

      if (authError) throw authError
      userId = authUser.user.id

      // Create profile
      await supabaseAdmin
        .from('profiles')
        .insert({ id: userId, email, name, phone })
    }

    // Create RSVP
    const { data: rsvp, error } = await supabaseAdmin
      .from('rsvps')
      .insert({
        user_id: userId,
        drop_id: drop.id,
        status,
        dietary_notes: dietaryNotes
      })
      .select()
      .single()

    if (error) throw error

    // TODO: Send confirmation email

    return NextResponse.json({ 
      rsvpId: rsvp.id, 
      status,
      message: status === 'requested' 
        ? 'RSVP received! You\'ll hear from us soon.'
        : 'You\'re on the waitlist. We\'ll notify you if a spot opens.'
    })

  } catch (error) {
    console.error('RSVP error:', error)
    return NextResponse.json({ error: 'Failed to create RSVP' }, { status: 500 })
  }
}
```

### Check-in Endpoint

Create `app/api/checkin/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { code } = await request.json()

    // Verify user session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Decode check-in code (format: dropSlug:timestamp)
    const [dropSlug] = code.split(':')

    // Get drop
    const { data: drop } = await supabase
      .from('drops')
      .select('id, title, date_time')
      .eq('slug', dropSlug)
      .single()

    if (!drop) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
    }

    // Verify RSVP
    const { data: rsvp } = await supabase
      .from('rsvps')
      .select('id, status')
      .eq('user_id', session.user.id)
      .eq('drop_id', drop.id)
      .single()

    if (!rsvp || rsvp.status !== 'confirmed') {
      return NextResponse.json({ error: 'No confirmed RSVP' }, { status: 403 })
    }

    // Create check-in
    const { data: checkin, error } = await supabase
      .from('checkins')
      .insert({
        user_id: session.user.id,
        drop_id: drop.id
      })
      .select()
      .single()

    if (error && error.code === '23505') {
      // Already checked in
      return NextResponse.json({ message: 'Already checked in' })
    }

    // Generate receipt
    const { data: receiptCount } = await supabase
      .from('receipts')
      .select('id', { count: 'exact', head: true })
      .eq('drop_id', drop.id)

    const dropNumber = parseInt(dropSlug.split('-')[1]) || 1
    const guestNumber = (receiptCount || 0) + 1

    const receiptCode = `C25-${String(dropNumber).padStart(3, '0')}-${String(guestNumber).padStart(2, '0')}`

    const { data: receipt } = await supabase
      .from('receipts')
      .insert({
        user_id: session.user.id,
        drop_id: drop.id,
        code: receiptCode
      })
      .select()
      .single()

    return NextResponse.json({
      receipt: {
        code: receiptCode,
        dropTitle: drop.title,
        date: drop.date_time
      }
    })

  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json({ error: 'Check-in failed' }, { status: 500 })
  }
}
```

---

## Step 8: Update RSVP Modal

Update `components/RSVPModal.tsx`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  try {
    const response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dropSlug: 'tokyo-midnight', // or get from props
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dietaryNotes: formData.dietary
      })
    })

    const data = await response.json()

    if (response.ok) {
      setSubmitted(true)
      // Show success message
    } else {
      alert(data.error || 'Something went wrong')
    }
  } catch (error) {
    console.error('RSVP error:', error)
    alert('Failed to submit RSVP')
  }
}
```

---

## Step 9: Add Email Integration

Install Resend:

```bash
npm install resend
```

Add to `.env.local`:
```env
RESEND_API_KEY=your-resend-key
```

Create `lib/email.ts`:

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendRSVPConfirmation({
  to,
  name,
  dropTitle,
  magicLink
}: {
  to: string
  name: string
  dropTitle: string
  magicLink: string
}) {
  await resend.emails.send({
    from: 'Club25 <hello@club25.co>',
    to,
    subject: `Your RSVP for ${dropTitle}`,
    html: `
      <h2>Welcome to Club25</h2>
      <p>Hi ${name},</p>
      <p>Your RSVP for <strong>${dropTitle}</strong> has been received.</p>
      <p>We'll confirm your seat soon.</p>
      <p><a href="${magicLink}">Access your Club25 account</a></p>
    `
  })
}
```

---

## Step 10: Test the API

```bash
# Start dev server
npm run dev

# Test RSVP
curl -X POST http://localhost:3000/api/rsvp \
  -H "Content-Type: application/json" \
  -d '{
    "dropSlug": "tokyo-midnight",
    "name": "Test User",
    "email": "test@example.com"
  }'
```

---

## Next Steps

1. **Build Guest App**
   - `/checkin` page with QR scanner
   - `/live` page with prompts
   - `/gallery` page for photos

2. **Build Host Dashboard**
   - `/admin` with authentication
   - Drop management
   - Guest list
   - Live controls

3. **Add Real-time**
   - Supabase Realtime channels
   - Live prompt broadcasting
   - Gallery updates

4. **Deploy**
   - Push to Vercel
   - Configure environment variables
   - Test production

---

## Option 2: Custom API (Node.js)

If you prefer more control, you can build a separate API service:

```bash
# Create API directory
mkdir club25-api
cd club25-api
npm init -y

# Install dependencies
npm install fastify @fastify/cors postgres drizzle-orm
npm install -D tsx typescript @types/node

# Create server
# api/index.ts
```

This gives you full control but requires more setup.

---

## Recommended Flow

1. ✅ **Week 1:** Supabase + basic API (RSVP)
2. **Week 2:** Check-in system + receipts
3. **Week 3:** Gallery + prompts
4. **Week 4:** Host dashboard
5. **Week 5:** Real-time features
6. **Week 6:** Polish + deploy

Start with Supabase to move fast, migrate to custom API later if needed.
