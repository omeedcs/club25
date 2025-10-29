# Club25 Backend Setup Guide

Complete setup instructions to get the full Club25 system running.

---

## ⚡ Quick Start

### 1. Install Dependencies

Already done! Packages installed:
- `@supabase/supabase-js`
- `@supabase/auth-helpers-nextjs`
- `resend`
- `qrcode`
- `nanoid`

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to initialize (~2 minutes)
3. Go to **Project Settings → API**
4. Copy your credentials:
   - Project URL
   - `anon` public key
   - `service_role` key (keep secret!)

### 3. Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy the contents of `supabase/schema.sql`
4. Run the query
5. You should see tables created in **Database → Tables**

### 4. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your credentials:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Resend (Email)
   RESEND_API_KEY=re_xxx  # Get from resend.com

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Admin
   ADMIN_EMAIL=your-email@example.com
   ```

### 5. Set Up Resend (Email)

1. Go to [resend.com](https://resend.com)
2. Sign up / Sign in
3. Go to **API Keys** → Create API Key
4. Add to `.env.local`

**Note:** In development, emails will go to the email address you used to sign up for Resend.

### 6. Create Your First Drop

You need to manually create drops in Supabase:

1. Go to **Database → drops**
2. Click **Insert row**
3. Fill in:
   ```
   slug: tokyo-midnight
   title: Tokyo Midnight
   date_time: 2024-12-01 19:00:00+00
   seat_limit: 12
   description: izakaya energy meets dim jazz...
   status: announced
   ```
4. Save

### 7. Start the Dev Server

```bash
npm run dev
```

Visit **http://localhost:3000**

---

## 🎯 Testing the Full Flow

### Test RSVP

1. Go to **http://localhost:3000**
2. Click "RESERVE YOUR SEAT"
3. Fill out the form
4. Check your email for confirmation

### Check Database

1. Go to Supabase → **Database → rsvps**
2. You should see your new RSVP

### Test User Dashboard

1. Go to **http://localhost:3000/login**
2. Enter your email
3. Check email for magic link
4. Click link → redirects to `/my/drops`
5. See your RSVPs and receipts

---

## 📊 Database Tables

Created by `supabase/schema.sql`:

- **profiles** - User information
- **drops** - Event data
- **rsvps** - Reservations
- **checkins** - QR code check-ins
- **receipts** - Digital mementos
- **media** - Photo uploads
- **prompts** - Conversation starters
- **keys** - Membership tiers
- **waitlist_notifications** - Waitlist alerts

---

## 🔐 Authentication

Using Supabase Auth with magic links:

- **No passwords** - Users receive email links
- **JWT-based** - Secure token authentication
- **Row Level Security** - Database enforces permissions

---

## 📧 Email Templates

In `lib/email.ts`:

1. **RSVP Confirmation** - Sent immediately after reservation
2. **Check-in Reminder** - Sent 24 hours before event
3. **Post-Event Recap** - Sent 24 hours after event
4. **Waitlist Alert** - Sent when spot opens

---

## 🎨 Color System

All colors are in `tailwind.config.js`:

```javascript
'club-blue': '#0047BB',      // Primary
'club-cream': '#F9F7F3',     // Text/backgrounds
'club-lilac': '#4A3E8E',     // Accents
'club-charcoal': '#1E1E1E',  // Modal backgrounds
'club-gold': '#C7A977',      // Highlights
```

---

## 🚀 API Endpoints

### Public

- `GET /api/drops/current` - Get current drop
- `GET /api/drops/archive` - Get completed drops
- `GET /api/drops/[slug]` - Get specific drop
- `POST /api/rsvp` - Create RSVP

### Authenticated

- `GET /api/drops/[slug]/gallery` - View photos
- `POST /api/drops/[slug]/media` - Upload photo

### Admin (Coming Soon)

- `POST /api/admin/drop` - Create/edit drop
- `PATCH /api/admin/rsvp/:id` - Confirm/waitlist
- `GET /api/admin/guests` - View guest list

---

## 🎯 Next Steps

### Create More Drops

```sql
INSERT INTO drops (slug, title, date_time, seat_limit, description, status)
VALUES (
  'red-thread',
  'Red Thread',
  '2024-12-15 19:00:00+00',
  12,
  'the kind of night where strangers become co-conspirators in something beautiful.',
  'announced'
);
```

### Add Prompts

```sql
INSERT INTO prompts (drop_id, text, phase, active)
VALUES (
  (SELECT id FROM drops WHERE slug = 'tokyo-midnight'),
  'What meal changed your life?',
  'appetizer',
  true
);
```

### Add Archive Drops

Set status to `'completed'` for past drops:

```sql
UPDATE drops
SET status = 'completed'
WHERE date_time < NOW();
```

---

## 🐛 Troubleshooting

### "Unauthorized" errors

- Check that your Supabase keys are correct in `.env.local`
- Restart dev server after changing env variables

### Emails not sending

- Check Resend API key
- In development, emails only go to your Resend account email
- Verify Resend domain in production

### RSVP not working

- Check Supabase connection
- Verify drop has `status = 'announced'`
- Check browser console for errors

### Can't access admin routes

- Make sure your email matches `ADMIN_EMAIL` in `.env.local`
- Sign in via magic link first

---

## 📱 Features Implemented

✅ **Backend**
- Supabase database with RLS
- User authentication (magic links)
- RSVP system with waitlist
- Email confirmations

✅ **Frontend**
- Dynamic current drop
- Real-time seat counter
- Archive from database
- Individual drop pages
- User dashboard
- Skip intro button

✅ **UX**
- Loading states
- Error handling
- Success confirmations
- Responsive design

---

## 🚧 Coming Soon

- Admin dashboard
- QR code check-in
- Photo gallery uploads
- Live prompts system
- Membership keys
- Spotify integration
- Real-time seat updates

---

## 🎉 You're Ready!

The backend is fully connected. RSVPs go to Supabase, emails are sent via Resend, and users can view their drops.

**Test it end-to-end:**
1. Create a drop in Supabase
2. Visit your site
3. Submit an RSVP
4. Check your email
5. Sign in and view your dashboard

Questions? Check the code comments or Supabase docs.
