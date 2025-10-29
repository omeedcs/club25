# Club25 System Architecture

Building Club25 from a landing page → a living digital experience.

## 🎯 Vision

Transform Club25 into a **social operating system** for immersive dinner experiences where:
- Attendance becomes identity
- Every night has an afterlife
- The physical and digital merge seamlessly

---

## 📐 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      CLUB25 ECOSYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  PUBLIC SITE (Next.js)          API BACKEND (Node/Supabase) │
│  ├─ Landing                     ├─ Auth & Sessions          │
│  ├─ Current Drop                ├─ RSVP Management          │
│  ├─ Archive                     ├─ Check-in System          │
│  └─ RSVP Form                   ├─ Photo Gallery            │
│                                  ├─ Digital Receipts         │
│  GUEST APP                      ├─ Prompts Engine           │
│  ├─ QR Check-in                 └─ Real-time Channels       │
│  ├─ Live Prompts                                            │
│  ├─ Photo Upload               HOST DASHBOARD               │
│  ├─ Gallery View                ├─ Drop Management          │
│  └─ Digital Receipt             ├─ Guest List               │
│                                  ├─ Prompt Triggers          │
│  MEMBERSHIP                     ├─ Media Approval           │
│  ├─ Receipt Collection          └─ Analytics                │
│  ├─ Key System                                              │
│  └─ Priority Access            INTEGRATIONS                 │
│                                  ├─ Spotify (Audio)          │
│                                  ├─ Philips Hue (Lights)     │
│                                  ├─ Resend (Email)           │
│                                  └─ Stripe (Payments)        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Tech Stack (Recommended)

### Option A: Fast Start (Serverless)
```
Frontend:   Next.js 14 (App Router) on Vercel
Backend:    Supabase (Postgres + Auth + Realtime + Storage)
Email:      Resend
Payments:   Stripe
Media:      Supabase Storage + Next/Image
Real-time:  Supabase Realtime Channels
```

**Pros:** Minimal setup, integrated auth, built-in realtime  
**Cons:** Vendor coupling, realtime limits at scale

### Option B: More Control
```
Frontend:   Next.js 14 on Vercel
API:        Node.js (Fastify/Express) on Fly.io/Render
Database:   Postgres (Neon/Supabase/RDS)
ORM:        Drizzle or Prisma
Real-time:  Socket.IO + Redis (Upstash)
Storage:    Cloudflare R2 or S3
Queue:      BullMQ (for delayed emails)
Email:      Resend/Postmark
```

**Pros:** Portable, scalable, full control  
**Cons:** More setup complexity

---

## 📊 Database Schema

```sql
-- Users
users
  id              uuid PRIMARY KEY
  email           text UNIQUE
  name            text
  phone           text
  created_at      timestamp
  
-- Drops (themed events)
drops
  id              uuid PRIMARY KEY
  slug            text UNIQUE (e.g., 'tokyo-midnight')
  title           text
  date_time       timestamp
  seat_limit      integer
  description     text
  short_copy      text
  status          enum('draft', 'announced', 'sold_out', 'completed')
  hero_image_url  text
  created_at      timestamp
  
-- RSVPs
rsvps
  id              uuid PRIMARY KEY
  user_id         uuid REFERENCES users(id)
  drop_id         uuid REFERENCES drops(id)
  status          enum('requested', 'confirmed', 'waitlist', 'cancelled')
  dietary_notes   text
  created_at      timestamp
  
-- Check-ins (QR scan attendance)
checkins
  id              uuid PRIMARY KEY
  user_id         uuid REFERENCES users(id)
  drop_id         uuid REFERENCES drops(id)
  scanned_at      timestamp
  device_hash     text
  
-- Prompts (conversation starters)
prompts
  id              uuid PRIMARY KEY
  drop_id         uuid REFERENCES drops(id) -- null = global
  text            text
  phase           enum('arrival', 'appetizer', 'main', 'dessert')
  weight          integer (for randomization)
  active          boolean
  
-- Messages (live broadcasts)
messages
  id              uuid PRIMARY KEY
  drop_id         uuid REFERENCES drops(id)
  type            enum('prompt', 'quote', 'announcement')
  payload         jsonb
  sent_at         timestamp
  
-- Media (photos/videos)
media
  id              uuid PRIMARY KEY
  drop_id         uuid REFERENCES drops(id)
  user_id         uuid REFERENCES users(id) -- null = host
  url             text
  type            enum('photo', 'video')
  approved        boolean DEFAULT false
  created_at      timestamp
  
-- Receipts (digital mementos)
receipts
  id              uuid PRIMARY KEY
  user_id         uuid REFERENCES users(id)
  drop_id         uuid REFERENCES drops(id)
  code            text UNIQUE (e.g., 'C25-005-07')
  nft_tx_hash     text -- optional blockchain integration
  created_at      timestamp
  
-- Keys (membership tiers)
keys
  id              uuid PRIMARY KEY
  user_id         uuid REFERENCES users(id)
  tier            enum('bronze', 'silver', 'gold', 'platinum')
  drops_attended  integer
  awarded_at      timestamp
```

---

## 🔌 API Endpoints

### Public Endpoints

```typescript
// Get current announced drop
GET /api/drop/current
Response: { drop: Drop }

// Submit RSVP
POST /api/rsvp
Body: { dropSlug, name, email, phone?, dietaryNotes? }
Response: { rsvpId, status: 'requested' | 'confirmed' | 'waitlist' }

// Check-in via QR
POST /api/checkin
Body: { code: string } // from QR code
Auth: Magic link session
Response: { receipt: { code, dropTitle, date } }
```

### Guest Endpoints (Authenticated)

```typescript
// Get my receipts
GET /api/me/receipts
Response: { receipts: Receipt[] }

// Get drop details (if checked in)
GET /api/drop/:slug/details
Response: { drop: Drop, attendees: number, gallery: Media[] }

// Get live prompts
GET /api/drop/:slug/prompts
Response: { prompts: Prompt[] }

// Upload photo to gallery
POST /api/drop/:slug/media
Body: multipart/form-data (photo file)
Response: { mediaId, status: 'pending_approval' }

// Get private gallery
GET /api/drop/:slug/gallery
Response: { media: Media[] }
```

### Admin Endpoints (Host Only)

```typescript
// Create/update drop
POST /api/admin/drop
Body: { slug, title, dateTime, seatLimit, description, ... }

// Manage RSVPs
PATCH /api/admin/rsvp/:id
Body: { status: 'confirmed' | 'waitlist' | 'cancelled' }

// Get guest list
GET /api/admin/drop/:slug/guests
Response: { guests: (User & RSVP & Checkin?)[] }

// Broadcast message
POST /api/admin/drop/:slug/broadcast
Body: { type: 'prompt' | 'announcement', payload: any }

// Approve media
PATCH /api/admin/media/:id
Body: { approved: boolean }

// Trigger email
POST /api/admin/drop/:slug/send-recap
Sends post-event recap emails
```

---

## 🔐 Authentication Flow

```
1. Guest submits RSVP → user created, email saved
2. Host confirms RSVP → user receives magic link email
3. User clicks link → JWT session created
4. User can now:
   - Check in via QR
   - Access gallery
   - Upload photos
   - View receipts
```

**Implementation:**
- Supabase Auth (magic links)
- Or custom JWT with Resend for email delivery

---

## 📱 Guest Experience Flow

### Pre-Event
```
1. Discover drop on website
2. Submit RSVP
3. Receive confirmation email with:
   - Event details
   - What to expect
   - Magic link to "your Club25 account"
```

### Day of Event
```
1. Receive reminder email with QR code
2. Arrive at apartment
3. Scan QR code (or host scans guest)
4. Phone enters "Live Mode":
   - Screen dims
   - Ambient sound plays
   - Welcome message appears
5. Throughout dinner:
   - Prompts appear at timed intervals
   - Can upload photos to private gallery
   - Can view gallery as it grows
```

### Post-Event
```
1. 24 hours later: Receive "Memory Capsule" email
   - Digital receipt (C25-005-03)
   - Anonymous quotes from the night
   - Link to full gallery
   - Invitation to next drop
2. Receipt appears in "my receipts" on profile
3. If 3+ drops attended → Key awarded
```

---

## 🎭 Feature Modules

### Module 1: QR Check-In System

**Flow:**
1. Host dashboard generates unique QR for each confirmed guest
2. Guest scans QR → validates RSVP → creates check-in record
3. Guest device receives session token
4. Guest enters "Live Mode" web app

**Tech:**
```typescript
// Generate QR codes
import QRCode from 'qrcode'

const code = `${process.env.APP_URL}/checkin?token=${encryptedToken}`
const qrDataUrl = await QRCode.toDataURL(code)
```

**Tables:** `checkins`

---

### Module 2: Digital Receipts

**What it is:**  
A unique code (e.g., `C25-005-07`) proving attendance at a specific drop.

**Format:**
```
C25    -    005    -    07
^           ^           ^
Club25      Drop #      Guest #
```

**Implementation:**
```typescript
// On check-in
const receipt = {
  code: `C25-${String(dropNumber).padStart(3, '0')}-${String(guestNumber).padStart(2, '0')}`,
  userId,
  dropId,
  createdAt: new Date()
}

// Optional: Mint as NFT (Polygon, Base)
// Using thirdweb SDK or Alchemy
```

**Future:** Visual receipt card (PNG) with:
- Drop title
- Date
- Guest name
- Unique code
- Mood color palette

**Tables:** `receipts`

---

### Module 3: Private Photo Gallery

**Flow:**
1. Guests upload photos during/after event
2. Host approves in admin dashboard
3. Approved photos appear in private gallery
4. Gallery accessible only to attendees of that drop
5. After 7 days → archived (still viewable)

**Tech:**
```typescript
// Upload endpoint
POST /api/drop/:slug/media
- Validate: user attended this drop
- Upload to storage (Supabase/R2)
- Create media record (approved: false)

// Gallery endpoint  
GET /api/drop/:slug/gallery
- Validate: user attended this drop
- Return approved media only
```

**UI Features:**
- Masonry grid layout
- Lightbox view
- Download all as zip
- "Add to my memories" button

**Tables:** `media`

---

### Module 4: Live Prompts System

**What it is:**  
Conversation starters that appear on guests' phones throughout the evening.

**Phases:**
- **Arrival:** Light icebreakers
- **Appetizer:** Deeper questions
- **Main:** Philosophical/personal
- **Dessert:** Reflective/gratitude

**Implementation:**
```typescript
// Prompts DB
[
  {
    text: "What meal changed your life?",
    phase: "appetizer",
    weight: 1.0
  },
  {
    text: "Describe your happiest accident.",
    phase: "main",
    weight: 0.8
  }
]

// Client fetches prompts filtered by phase
GET /api/drop/:slug/prompts?phase=appetizer

// Host can manually trigger via dashboard
POST /api/admin/drop/:slug/broadcast
{ type: "prompt", payload: { text: "..." } }
```

**Real-time delivery:** Supabase Realtime or Socket.IO

**Tables:** `prompts`, `messages`

---

### Module 5: Host Dashboard

**URL:** `/admin` (password protected)

**Features:**
- **Drop Management**
  - Create new drops
  - Edit details
  - View RSVPs
  - Confirm/waitlist guests
  
- **Live Control Panel** (during event)
  - See who's checked in
  - Trigger prompts
  - Broadcast messages
  - View/approve uploaded photos
  
- **Post-Event**
  - Review gallery
  - Send recap emails
  - View analytics
  
- **Membership**
  - See key holders
  - Award special access

**Tech:**
```typescript
// Protect route
middleware.ts:
  if (pathname.startsWith('/admin')) {
    if (!session || !isAdmin(session.user)) {
      redirect('/login')
    }
  }
```

---

### Module 6: Membership Keys

**Tiers:**
- **Bronze** — 1-2 drops attended
- **Silver** — 3-5 drops
- **Gold** — 6-10 drops
- **Platinum** — 10+ drops

**Benefits:**
- **Bronze:** Digital receipt collection
- **Silver:** 24hr early RSVP access
- **Gold:** Bring a +1 once per quarter
- **Platinum:** Guaranteed seat, special menu notes

**Implementation:**
```typescript
// Check-in creates receipt
// Count receipts → award key if threshold met
const receiptsCount = await db.receipts.count({ where: { userId } })

if (receiptsCount === 3 && !userHasKey(userId, 'silver')) {
  await db.keys.create({
    userId,
    tier: 'silver',
    dropsAttended: receiptsCount
  })
  
  // Send congrats email
  await sendKeyAwardEmail(user, 'silver')
}
```

**Tables:** `keys`

---

### Module 7: Audio & Lighting Sync

**Goal:** Environment reacts to the menu/mood.

**Implementation:**
- **Spotify API:** Queue tracks for each course
- **Philips Hue API:** Change lighting per phase
- Triggered from host dashboard

```typescript
// Spotify
import SpotifyWebApi from 'spotify-web-api-node'

await spotify.play({
  uris: ['spotify:track:...'],
  device_id: speakerDeviceId
})

// Hue
import { HueApi } from 'node-hue-api'

await hue.lights.setLightState(lightId, {
  on: true,
  bri: 180,
  hue: 46920 // blue
})
```

---

### Module 8: Post-Event Recap Email

**Sent:** 24 hours after event

**Includes:**
- Thank you message
- Digital receipt
- 2-3 anonymous quotes from the night
- Link to private gallery
- Preview of next drop

**Implementation:**
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'Club25 <hello@club25.co>',
  to: guest.email,
  subject: 'Your Night at Club25 — Tokyo Midnight',
  html: RecapEmailTemplate({
    guestName: guest.name,
    dropTitle: drop.title,
    receipt: receipt.code,
    quotes: selectedQuotes,
    galleryUrl: `${baseUrl}/drop/${drop.slug}/gallery`
  })
})
```

Automate via:
- Supabase function (cron job)
- Vercel cron
- BullMQ delayed job

---

## 🔄 Real-Time Architecture

### Channels (Supabase Realtime or Socket.IO)

```typescript
// Drop-specific channel
drop:{dropId}:broadcast
  - Host → Guests: prompts, announcements
  
drop:{dropId}:presence
  - Track who's currently "live" in the app
  
drop:{dropId}:gallery
  - New photos uploaded (after approval)
  
drop:{dropId}:quotes
  - Anonymous text snippets (moderated)
```

### Client Connection

```typescript
// Guest device
const channel = supabase.channel(`drop:${dropId}:broadcast`)

channel
  .on('broadcast', { event: 'prompt' }, (payload) => {
    showPrompt(payload.text)
  })
  .subscribe()
```

---

## 📂 File Structure

```
club25/
├── app/
│   ├── (public)/
│   │   ├── page.tsx               # Landing
│   │   ├── drop/[slug]/page.tsx   # Drop details
│   │   └── archive/page.tsx       # Archive
│   ├── (guest)/
│   │   ├── checkin/page.tsx       # QR check-in
│   │   ├── live/page.tsx          # Live mode UI
│   │   ├── gallery/page.tsx       # Photo gallery
│   │   └── receipts/page.tsx      # My receipts
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── page.tsx           # Dashboard
│   │   │   ├── drops/page.tsx     # Manage drops
│   │   │   ├── guests/page.tsx    # Guest list
│   │   │   └── live/page.tsx      # Live control
│   ├── api/
│   │   ├── rsvp/route.ts
│   │   ├── checkin/route.ts
│   │   ├── drop/[slug]/
│   │   │   ├── prompts/route.ts
│   │   │   ├── gallery/route.ts
│   │   │   └── media/route.ts
│   │   └── admin/
│   │       ├── drop/route.ts
│   │       └── broadcast/route.ts
│   └── layout.tsx
├── components/
│   ├── (landing)/
│   │   ├── Intro.tsx
│   │   ├── CurrentChapter.tsx
│   │   └── ...
│   ├── (guest)/
│   │   ├── LiveMode.tsx
│   │   ├── PromptCard.tsx
│   │   └── GalleryGrid.tsx
│   └── (admin)/
│       ├── DropForm.tsx
│       ├── GuestList.tsx
│       └── LiveControls.tsx
├── lib/
│   ├── supabase.ts
│   ├── auth.ts
│   └── utils.ts
└── types/
    └── database.ts
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1-2)
✅ Landing page (done)  
✅ RSVP form (done)  
✅ Logo & audio integration (done)  
⬜ Supabase setup  
⬜ Auth (magic links)  
⬜ Database schema  

### Phase 2: Check-In System (Week 3)
⬜ QR code generation  
⬜ Check-in endpoint  
⬜ Guest "Live Mode" UI  
⬜ Digital receipts  

### Phase 3: Gallery & Prompts (Week 4)
⬜ Photo upload  
⬜ Gallery view  
⬜ Prompts system  
⬜ Real-time channels  

### Phase 4: Host Dashboard (Week 5)
⬜ Admin authentication  
⬜ Drop management UI  
⬜ Guest list view  
⬜ Live controls  

### Phase 5: Membership & Polish (Week 6)
⬜ Key system  
⬜ Post-event emails  
⬜ Analytics  
⬜ Spotify/Hue integration  

---

## 💡 Advanced Ideas (Future)

1. **Anonymous Quote Wall**
   - Guests submit anonymous thoughts
   - Projected on wall during dessert

2. **Taste Profiles**
   - Track guest preferences over drops
   - Personalized menu suggestions

3. **Multi-City Expansion**
   - `club25.world` → global platform
   - Each city runs own drops
   - Shared receipt collection

4. **Storytelling Mode**
   - Host records voice notes between courses
   - Guests listen via app
   - Builds narrative arc

5. **Collaborative Playlist**
   - Guests vote on music
   - Algorithm balances mood

6. **AR Table Markers**
   - Point phone at plate
   - See ingredient origins
   - Chef's notes appear

---

## 🔧 Next Steps

1. **Set up Supabase project**
   ```bash
   npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
   ```

2. **Create database tables** (run migrations)

3. **Build API routes** (start with RSVP)

4. **Create guest check-in flow**

5. **Build host dashboard**

---

**Club25 is evolving from a website into an operating system for memorable experiences.**
