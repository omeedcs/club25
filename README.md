# Club25 Website

A full-stack Next.js application for Club25 — an intimate supper club experience in Dallas, TX.

**Complete with backend, admin dashboard, RSVP system, and real-time data.**

## 🪩 What is Club25?

Club25 is not a restaurant — it's a living installation. Every event feels like part dinner, part art show, part secret drop. We design cinematic moments that fuse food, design, music, and technology into immersive evenings.

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## 📁 Project Structure

```
club25/
├── app/
│   ├── layout.tsx       # Root layout with metadata
│   ├── page.tsx         # Main page component
│   └── globals.css      # Global styles + film grain effect
├── components/
│   ├── Intro.tsx        # Landing section with fade-in animation
│   ├── CurrentChapter.tsx  # Current event display + RSVP
│   ├── RSVPModal.tsx    # Reservation form modal
│   ├── Concept.tsx      # About Club25
│   ├── Archive.tsx      # Past events archive
│   ├── Footer.tsx       # Contact + social links
│   └── AudioPlayer.tsx  # Ambient music player
└── public/
    └── audio/           # Place your ambient track here
```

## 🎨 Key Features

- **Card Cascade Entrance:** Dramatic falling cards animation that reveals the current drop
  - 0-300ms: Blue flash + audio trigger
  - 300-1200ms: 10 cards cascade from above with spring physics
  - 1200-1800ms: Cards arrange into grid, center card highlights
  - GPU-accelerated, respects `prefers-reduced-motion`
- **Cinematic Design:** Deep blue gradient backgrounds with film grain effect
- **Framer Motion Animations:** Smooth fade-ins, scroll-triggered reveals, hover effects
- **Ambient Audio:** Auto-playing background music (after user interaction)
- **Haptic Feedback:** Subtle vibration on mobile tap
- **RSVP System:** Modal form for reservations (ready to connect to backend)
- **Archive Grid:** Display past chapters with quotes and dates
- **Responsive:** Mobile-first design with Tailwind CSS

## 🎵 Adding Your Audio

1. Place your ambient track in `public/audio/ambient.mp3`
2. Uncomment the audio source in `components/AudioPlayer.tsx`:
   ```tsx
   <source src="/audio/ambient.mp3" type="audio/mpeg" />
   ```

## 🔄 Updating for New Drops

### Current Chapter
Edit `components/CurrentChapter.tsx`:
```typescript
const currentChapter = {
  title: 'Your New Chapter',
  date: 'Date Here',
  description: 'Your poetic description...',
  seatsRemaining: 10,
  totalSeats: 12
}
```

### Archive
Add to the `pastChapters` array in `components/Archive.tsx`:
```typescript
{
  title: 'Chapter Name',
  date: 'Date',
  quote: '"A memorable quote from the evening"'
}
```

## 🔌 Backend Integration

The RSVP form in `RSVPModal.tsx` is ready to connect to:
- **Formspree** (easy, no backend needed)
- **Supabase** (full database)
- **Custom API** (your own endpoint)

Replace the `handleSubmit` function with your backend logic.

## 🎨 Color System

Based on the Club25 logo — deep electric blue with cream text.

### Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  'club-blue': '#0047BB',      // Primary: Deep Electric Blue
  'club-cream': '#F9F7F3',     // Secondary: Off-White/Cream
  'club-lilac': '#4A3E8E',     // Accent: Midnight Lilac
  'club-charcoal': '#1E1E1E',  // Neutral: Graphite
  'club-gold': '#C7A977',      // Highlight: Warm Gold
}
```

See `COLOR_SYSTEM.md` for detailed usage guidelines.

### Fonts
Edit `app/layout.tsx` to change from Inter to your preferred font.

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🚀 Deploy

Deploy to Vercel, Netlify, or any platform that supports Next.js:

```bash
# Vercel (recommended)
vercel

# Or use the deployment tool in your IDE
```

## 🧪 Future Features

- [ ] Individual drop pages (`/drops/tokyo-midnight`)
- [ ] Guest check-in system with QR codes
- [ ] Live social prompts during events
- [ ] Photo gallery integration
- [ ] Email newsletter integration
- [ ] Payment integration for ticketing

## 📝 Notes

- All animations respect `prefers-reduced-motion`
- Film grain effect is optimized for performance
- Audio only plays after user interaction (browser requirement)
- Mobile responsive with touch-friendly interactions

---

**Club25** — a collective of rooms, flavors, and ideas.
