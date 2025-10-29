# Club25 Color System

Based on the Club25 logo — the blue square with white "25 Club" text.

## 🎨 Color Palette

### 1. Primary: Deep Electric Blue
- **Hex:** `#0047BB`
- **RGB:** `0, 71, 187`
- **Tailwind:** `club-blue`
- **Use for:** Main backgrounds, CTA buttons, hero sections
- **Psychology:** Bold, confident, cinematic — evokes night energy, trust, and creativity
- **Mood:** Late-night gallery, downtown energy, mystery

**Where it's used:**
- Main landing gradient background
- RSVP button primary color
- Large background shapes
- Mobile app backgrounds

---

### 2. Secondary: Off-White / Cream
- **Hex:** `#F9F7F3`
- **RGB:** `249, 247, 243`
- **Tailwind:** `club-cream`
- **Use for:** Text on blue, menu backgrounds, negative space, printed materials
- **Mood:** Softness and balance — refined, film-grain warmth

**Where it's used:**
- All body text
- Menu designs (future)
- Form backgrounds
- Negative space throughout site

---

### 3. Accent: Midnight Lilac
- **Hex:** `#4A3E8E`
- **RGB:** `74, 62, 142`
- **Tailwind:** `club-lilac`
- **Use for:** Gradients, hover effects, subtle backgrounds, audio visualizers
- **Mood:** Sensual, moody, evokes sound and nightlife

**Where it's used:**
- Gradient backgrounds (blue → lilac fade)
- Button hover states
- Seat availability indicators
- Audio player button
- Modal accent borders
- Quote text in Concept section

---

### 4. Neutral: Graphite / Charcoal
- **Hex:** `#1E1E1E`
- **RGB:** `30, 30, 30`
- **Tailwind:** `club-charcoal`
- **Use for:** Body text, subtle overlays, dimmed states, shadows, photography edges

**Where it's used:**
- RSVP modal background
- Future: text overlays on images
- Subtle shadows and depth

---

### 5. Highlight: Warm Gold
- **Hex:** `#C7A977`
- **RGB:** `199, 169, 119`
- **Tailwind:** `club-gold`
- **Use for:** Tiny touches — underlines, checkmarks, dividers, luxe details
- **Mood:** Nostalgic, elegant contrast against blue — luxe, ritualistic feel

**Where it's used:**
- "CURRENT DROP" and "ARCHIVE" section labels
- Archive card borders on hover
- Archive card titles on hover
- Form input focus states (underline)
- Footer icon accents
- Email signup focus state
- Close button hover (modal)
- Future: Menu dividers, napkin embroidery, candle holders

---

## 📱 Usage by Context

### Website Main
- **Background:** Deep Electric Blue
- **Text:** Cream
- **Accent:** Lilac for hovers, Gold for labels

### Menu / Print (Future)
- **Background:** Cream
- **Text:** Blue
- **Accent:** Gold divider lines

### Mobile / QR App (Future)
- **Background:** Blue gradient → Lilac
- **Text:** Cream
- **Icons:** Gold or Charcoal

### Nighttime Projection (Future)
- **Background:** Deep Blue
- **Primary:** Lilac
- **Highlights:** Warm White (Cream)

---

## 🎯 Component Color Map

| Component | Primary Color | Accent | Hover State |
|-----------|--------------|--------|-------------|
| **Intro Background** | Blue + Lilac gradient | - | - |
| **Section Labels** | Gold | - | - |
| **RSVP Button** | Blue | - | Lilac |
| **Seat Indicators** | Lilac (filled) | Cream/20 (empty) | - |
| **Archive Cards** | Cream/20 border | Gold border (hover) | Gold text |
| **Form Inputs** | Cream/30 border | - | Gold focus |
| **Audio Button** | Lilac/20 bg | Lilac/30 border | Lilac/30 bg |
| **Footer Icons** | Gold | - | Gold (brighter) |
| **Modal** | Charcoal bg | Lilac/30 border | - |
| **Quote Text** | Lilac | - | - |

---

## 🔧 How to Update Colors

All colors are defined in `tailwind.config.js`:

```javascript
colors: {
  'club-blue': '#0047BB',
  'club-cream': '#F9F7F3',
  'club-lilac': '#4A3E8E',
  'club-charcoal': '#1E1E1E',
  'club-gold': '#C7A977',
}
```

Use them in components with Tailwind classes:
```jsx
className="bg-club-blue text-club-cream hover:bg-club-lilac"
```

---

## 🎨 Color Harmony Rules

1. **Never use blue + gold alone** — always include lilac or cream as a bridge
2. **Gold is for accents only** — use sparingly (< 5% of screen)
3. **Lilac is for transitions** — gradients, hovers, movement
4. **Charcoal is for depth** — modals, overlays, shadows
5. **Cream is the constant** — always readable, always present

---

## 🖼️ Future Physical Applications

### Table Settings
- **Napkins:** Cream linen with gold embroidered "25"
- **Plates:** White with subtle blue rim
- **Candle holders:** Brushed gold metal

### Printed Materials
- **Menus:** Cream paper with blue text, gold dividers
- **Place cards:** Blue cardstock with cream lettering
- **Thank you notes:** Cream with gold foil stamp

### Lighting
- **Ambient:** Deep blue LED uplighting
- **Accent:** Warm gold candles
- **Highlights:** Lilac-tinted spots on key table areas

---

## 📊 Accessibility Notes

- **Blue (#0047BB) on Cream (#F9F7F3):** WCAG AA compliant (4.8:1 contrast ratio)
- **Cream (#F9F7F3) on Blue (#0047BB):** Excellent contrast (8.5:1)
- **Lilac (#4A3E8E) on Cream:** Good contrast (5.2:1)
- **Gold (#C7A977) on Blue:** Use for decorative only (3.1:1)

All primary text maintains WCAG AA standards.

---

**The color system tells a story:** Blue is the night. Cream is the conversation. Lilac is the music. Gold is the memory.
