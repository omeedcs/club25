# Card Cascade Entrance Animation

A dramatic, cinematic entrance for Club25 that uses falling cards to reveal the current drop.

---

## 🎬 Animation Sequence

### Timeline

```
0ms        Dark screen, waiting for user tap
           ↓ [USER TAPS]
           
0-300ms    Quick blue flash (strobe effect)
           Audio starts playing
           Haptic feedback (mobile)
           
300-1200ms Cards cascade from above
           • 10 cards fall at random X positions
           • Slight rotation on each card
           • Staggered delays (0-300ms)
           • Soft spring bounce on landing
           
1200-1800ms Cards drift into grid formation
            • 2 rows × 5 columns
            • Center card scales up (130%)
            • "Current Drop" content appears
            • Other cards fade to 70% opacity
            
1800ms+    Grid fades out
           Scroll indicator appears
           Main content revealed
```

---

## 🎨 Visual Design

### Card Specifications
- **Size:** 128×192px (mobile), 160×224px (desktop)
- **Background:** Deep Electric Blue (#0047BB)
- **Border:** Midnight Lilac (#4A3E8E) at 30% opacity
- **Grain overlay:** SVG noise at 10% opacity
- **Corner radius:** 8px

### Center Card (Featured)
- **Scale:** 1.3× larger than others
- **Content:** "CURRENT DROP" label + event title
- **Label color:** Warm Gold (#C7A977)
- **Title:** White, serif font

### Other Cards
- **Content:** Large "25" watermark at 20% opacity
- **Purpose:** Visual rhythm, brand reinforcement

---

## ⚡ Performance Optimizations

### GPU Acceleration
```css
will-change: transform
transform: translate3d(x, y, 0)
```

### Reduced Motion
Respects `prefers-reduced-motion`:
- Skips cascade animation
- Directly shows grid
- Faster transitions

### Card Limit
Limited to 10 cards to maintain 60fps:
- Fewer DOM nodes
- Less transform calculations
- Better mobile performance

---

## 🔊 Audio Integration

### On User Interaction
1. Audio player starts ambient track
2. Volume fades in gradually
3. Loops throughout session

### Optional Enhancement
Add subtle SFX:
- **Whoosh** on card cascade start
- **Pop** when cards lock into grid
- Place in `public/audio/whoosh.mp3` and `public/audio/pop.mp3`

```typescript
// In CardCascadeIntro.tsx
const playSound = (file: string) => {
  const audio = new Audio(`/audio/${file}`)
  audio.volume = 0.3
  audio.play()
}

// On cascade start
playSound('whoosh.mp3')

// On grid lock
playSound('pop.mp3')
```

---

## 📱 Mobile Enhancements

### Haptic Feedback
Uses `navigator.vibrate(12)` on tap:
- 12ms vibration pulse
- Subtle tactile response
- Only on supported devices

### Touch Optimization
- Large tap area (full screen)
- No hover states needed
- Optimized for thumb reach

---

## 🎯 User Flow

```
┌─────────────────────────────────────┐
│  1. User lands on club25.co         │
│     → Sees dark screen               │
│     → "tap to enter" pulses          │
└─────────────────┬───────────────────┘
                  │ TAP
                  ▼
┌─────────────────────────────────────┐
│  2. Blue flash + audio starts        │
│     → Haptic feedback                │
│     → Visual confirmation            │
└─────────────────┬───────────────────┘
                  │ 300ms
                  ▼
┌─────────────────────────────────────┐
│  3. Cards fall from sky              │
│     → Random positions               │
│     → Bouncy, organic feel           │
└─────────────────┬───────────────────┘
                  │ 900ms
                  ▼
┌─────────────────────────────────────┐
│  4. Cards arrange into grid          │
│     → Center card highlights         │
│     → "Tokyo Midnight" revealed      │
└─────────────────┬───────────────────┘
                  │ 600ms
                  ▼
┌─────────────────────────────────────┐
│  5. Entrance fades out               │
│     → Scroll indicator appears       │
│     → Main site content visible      │
└─────────────────────────────────────┘
```

---

## 🎛️ Configuration

### Customizing the Center Card

Edit `CardCascadeIntro.tsx` line ~140:

```typescript
<div className="text-2xl font-serif text-center leading-tight">
  Tokyo<br />Midnight  {/* Change this to your current drop */}
</div>
```

### Adjusting Timing

```typescript
// Flash duration
setTimeout(() => setPhase('cascade'), 300)  // ← Change this

// Grid formation
setTimeout(() => setPhase('grid'), 1200)    // ← Change this

// Complete
setTimeout(() => setPhase('complete'), 1800) // ← Change this
```

### Card Count

Change line ~26:

```typescript
const cardCount = 10  // ← Adjust (recommended: 8-12)
```

### Grid Layout

Modify `getGridPosition()` function to change card arrangement:

```typescript
const row = Math.floor(index / 5)  // Cards per row
const col = index % 5
const isCenterCard = index === 7   // Which card is featured
```

---

## 🔧 Technical Implementation

### Key Technologies
- **Framer Motion:** Animation orchestration
- **React Hooks:** State management
- **CSS Transforms:** GPU-accelerated movement
- **Web Vibration API:** Haptic feedback

### Critical CSS
```css
.card {
  will-change: transform;
  transform: translate3d(x, y, 0) rotate(deg);
}
```

### Spring Physics
```typescript
transition={{
  type: 'spring',
  damping: 12,      // Lower = more bounce
  stiffness: 100,   // Higher = faster snap
}}
```

---

## 🎨 Design Tokens

```typescript
const ENTRANCE_TIMING = {
  FLASH: 300,
  CASCADE: 1200,
  GRID: 1800,
  FADE_OUT: 2600
}

const CARD_CONFIG = {
  COUNT: 10,
  WIDTH: 160,
  HEIGHT: 224,
  ROTATION_MAX: 15,  // degrees
  SPREAD_MAX: 40     // percent
}

const ANIMATION_EASING = {
  CASCADE: { damping: 12, stiffness: 100 },
  GRID: { damping: 20, stiffness: 150 }
}
```

---

## 🐛 Troubleshooting

### Cards not appearing
- Check that `userInteracted` state is updating
- Verify Framer Motion is installed
- Check console for errors

### Animation feels janky
- Reduce card count (try 6-8)
- Check for other heavy operations on page load
- Test on lower-end device

### Audio not starting
- Browser requires user interaction before audio
- Check audio file path is correct
- Verify AudioPlayer component is receiving state

### Haptic not working
- Only works on mobile devices
- Not supported in all browsers
- Check `navigator.vibrate` availability

---

## 🌟 Variations & Ideas

### Alternative Layouts
- **Single row:** All cards in a line
- **Circle:** Cards arranged in a circle
- **Pyramid:** Traditional card stack shape

### Enhanced Effects
- **Particle trail:** Cards leave light trails
- **Glow effect:** Cards pulse with blue glow
- **3D depth:** Add perspective transform
- **Card flip:** Reveal content with flip animation

### Interactive Elements
- **Swipe cards away:** Gesture to dismiss
- **Tap individual cards:** Explore other drops
- **Shake to reshuffle:** Playful interaction

---

## 📊 Performance Metrics

### Target Performance
- **60fps** throughout animation
- **< 100ms** interaction response
- **< 500kb** total asset size
- **< 2s** total animation duration

### Tested Devices
- ✅ iPhone 14 Pro (120hz)
- ✅ iPhone SE (60hz)
- ✅ Samsung Galaxy S23
- ✅ iPad Pro
- ✅ Desktop (Chrome, Safari, Firefox)

---

## 🚀 Future Enhancements

1. **Dynamic card content:** Show different info on each card
2. **Guest count:** Show number of seats remaining
3. **Weather integration:** Cards reflect current weather
4. **Time-based:** Different colors for time of day
5. **Sound reactive:** Cards pulse to music

---

**The entrance sets the tone — this is not just a website, it's a portal.**
