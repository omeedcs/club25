# Club25 Quick Start Guide

## 🎉 Your Site is Live!

The development server is running at: **http://localhost:3000**

## 📋 What's Built

### ✅ Complete Features
- **Cinematic landing page** with fade-in animations
- **Current Chapter section** with RSVP button
- **Interactive RSVP modal** with form validation
- **Concept/About section** explaining Club25
- **Archive grid** for past events
- **Footer** with contact info and email signup
- **Audio player** with volume control button
- **Film grain effect** for cinematic feel
- **Responsive design** (works on mobile, tablet, desktop)

## 🎯 Next Steps

### 1. Add Your Ambient Music
1. Create folder: `public/audio/`
2. Add your track: `public/audio/ambient.mp3`
3. Edit `components/AudioPlayer.tsx` line 19-20:
   ```tsx
   <source src="/audio/ambient.mp3" type="audio/mpeg" />
   ```

### 2. Update Current Event
Edit `components/CurrentChapter.tsx` (lines 10-16):
```typescript
const currentChapter = {
  title: 'Tokyo Midnight',        // Your chapter name
  date: 'November 15, 2024',      // Event date
  description: '...',              // Poetic description
  seatsRemaining: 8,               // Available seats
  totalSeats: 12                   // Total capacity
}
```

### 3. Connect RSVP Form to Backend

#### Option A: Formspree (Easiest)
1. Sign up at [formspree.io](https://formspree.io)
2. Edit `components/RSVPModal.tsx` line 21:
   ```typescript
   const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
     method: 'POST',
     body: JSON.stringify(formData),
     headers: { 'Content-Type': 'application/json' }
   })
   ```

#### Option B: Supabase (Full Database)
1. Create project at [supabase.com](https://supabase.com)
2. Install: `npm install @supabase/supabase-js`
3. Connect your database

#### Option C: Custom API
Point the form to your own endpoint

### 4. Customize Colors (Optional)
The color system is based on your logo. Edit `tailwind.config.js`:
```javascript
colors: {
  'club-blue': '#0047BB',      // Primary: Deep Electric Blue (logo)
  'club-cream': '#F9F7F3',     // Secondary: Off-White/Cream (text)
  'club-lilac': '#4A3E8E',     // Accent: Midnight Lilac (hovers)
  'club-charcoal': '#1E1E1E',  // Neutral: Graphite (overlays)
  'club-gold': '#C7A977',      // Highlight: Warm Gold (luxe touches)
}
```

**See `COLOR_SYSTEM.md` for complete usage guidelines.**

### 5. Add Past Events to Archive
Edit `components/Archive.tsx` (lines 7-20):
```typescript
const pastChapters = [
  {
    title: 'Lost Summer',
    date: 'October 28, 2024',
    quote: '"cold brew, linen, and the taste of citrus lingering on warm skin."'
  },
  // Add more chapters here
]
```

### 6. Update Contact Info
Edit `components/Footer.tsx`:
- Email address (line 39)
- Instagram handle (line 46)
- Location details (line 30)

## 🚀 Deploy Your Site

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload the .next folder to Netlify
```

## 🎨 Component Breakdown

| Component | Purpose |
|-----------|---------|
| `Intro.tsx` | Landing animation with "ENTER" button |
| `CurrentChapter.tsx` | Shows upcoming event + RSVP button |
| `RSVPModal.tsx` | Reservation form modal |
| `Concept.tsx` | About Club25 section |
| `Archive.tsx` | Grid of past events |
| `Footer.tsx` | Contact, social links, email signup |
| `AudioPlayer.tsx` | Background music control |

## 📱 Interactive Layer (Future Enhancement)

The vision includes:
- QR code check-in at events
- Guest phones play ambient sound
- Live social prompts during dinner
- Anonymous quotes displayed on screens

This would require:
1. Building a separate guest app/page
2. Real-time database (Firebase/Supabase)
3. QR code generation per event
4. WebSocket for live interactions

Would you like me to build this next?

## 🎥 Visual Assets You'll Need

For the full Club25 experience, shoot:
- **Low-light food photos** (hands, textures, close-ups)
- **Ambient space photos** (lighting, table settings)
- **Candid moments** (no faces, just atmosphere)

Place in `public/images/` and reference in components

## 🐛 Troubleshooting

**If site won't load:**
```bash
rm -rf .next node_modules
npm install
npm run dev
```

**If audio won't play:**
- Browsers require user interaction before audio plays
- Click the ENTER button or audio toggle button

**If TypeScript errors:**
```bash
npm run build
# This will show specific errors to fix
```

## 📝 Tips for Each Drop

1. Update chapter title/date/description
2. Add previous chapter to archive
3. Shoot 3-5 photos during event
4. Post one cryptic teaser to Instagram
5. Update archive with best quote from evening

---

**The site is ready to show the world.** Open http://localhost:3000 and step into Club25.
