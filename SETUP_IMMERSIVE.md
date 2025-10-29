# 🚀 Quick Start: Immersive Experience Setup

## Step 1: Apply Database Migration

Run the migration to add all new tables:

### Option A: Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard/project/klwxwprpmiddcfobxjpg
2. Click **SQL Editor** in sidebar
3. Open `/supabase/migrations/add_immersive_features.sql`
4. Copy all contents
5. Paste into SQL Editor
6. Click **Run**

### Option B: Supabase CLI (if installed)
```bash
supabase db push
```

---

## Step 2: Test the Experience Page

1. **Create a test RSVP**
   - Go to http://localhost:3001
   - Submit RSVP form
   - Get confirmation code

2. **Access Experience Page**
   - Click "ACCESS EXPERIENCE" on confirmation page
   - OR go directly to: `/experience/C25-XXXX-XXXX`

3. **What You'll See:**
   - ✅ Live phase indicator
   - ✅ Personalized conversation prompts
   - ✅ Live chat interface
   - ✅ Guest list with presence
   - ⚠️ Kitchen updates (need host to post)
   - ⚠️ AI match (need to seed data)
   - ⚠️ Photos (need upload feature)

---

## Step 3: Seed Test Data (Optional)

### Add Sample Kitchen Update
```sql
INSERT INTO kitchen_updates (drop_id, message, course, posted_by)
SELECT 
  id,
  'Starting to plate the main course! 🍽️',
  'main',
  (SELECT user_id FROM rsvps WHERE drop_id = drops.id LIMIT 1)
FROM drops 
WHERE status = 'announced'
LIMIT 1;
```

### Add Sample Message
```sql
INSERT INTO guest_messages (drop_id, from_user_id, message)
SELECT 
  d.id,
  r.user_id,
  'So excited to be here tonight!'
FROM drops d
JOIN rsvps r ON r.drop_id = d.id
WHERE d.status = 'announced'
LIMIT 1;
```

### Set Current Phase
```sql
INSERT INTO drop_phases (drop_id, current_phase)
SELECT id, 'arrival'
FROM drops
WHERE status = 'announced'
ON CONFLICT (drop_id) DO UPDATE
SET current_phase = 'appetizer';
```

---

## Step 4: Build Host Dashboard (Next Step)

Create `/app/host/[dropId]/page.tsx` with controls for:

### Phase Control
```tsx
<button onClick={() => updatePhase('appetizer')}>
  Move to Appetizer
</button>
```

### Kitchen Updates
```tsx
<form onSubmit={postKitchenUpdate}>
  <textarea placeholder="Update from kitchen..." />
  <button>Post Update</button>
</form>
```

### Photo Approval
```tsx
{pendingPhotos.map(photo => (
  <div key={photo.id}>
    <img src={photo.url} />
    <button onClick={() => approvePhoto(photo.id)}>
      Approve
    </button>
  </div>
))}
```

---

## Features Roadmap

### ✅ Phase 1: Core Features (DONE)
- [x] Live phase tracking
- [x] Kitchen updates display
- [x] Guest messaging
- [x] Personalized prompts
- [x] Photo gallery display
- [x] Real-time presence
- [x] AI match display

### 🚧 Phase 2: Interactions (Build Next)
- [ ] Host dashboard
- [ ] Photo upload UI
- [ ] Phase controls
- [ ] Kitchen update composer

### 🔮 Phase 3: AI & Advanced
- [ ] Personality analysis
- [ ] Match algorithm
- [ ] Proximity detection
- [ ] Ambient soundscapes

---

## Testing Checklist

- [ ] Migration applied successfully
- [ ] Experience page loads
- [ ] Guest prompts appear (after check-in)
- [ ] Phase indicator shows current phase
- [ ] Chat input works
- [ ] Guest list displays
- [ ] Presence indicators work
- [ ] Kitchen updates appear (if seeded)
- [ ] Photos display (if seeded)
- [ ] Real-time updates work

---

## Troubleshooting

### No prompts showing?
- Ensure guest has checked in
- Check `guest_prompts` table has rows
- Auto-assigned on check-in via trigger

### Real-time not working?
- Check Supabase RLS policies
- Verify user is authenticated
- Console for WebSocket errors

### Kitchen updates not appearing?
- Seed test data (see Step 3)
- Verify `drop_id` matches current drop

---

## Next Steps

1. **Apply migration** ✅
2. **Test experience page** 🧪
3. **Build host dashboard** 👨‍💼
4. **Add photo upload** 📸
5. **Implement AI matching** 🤖
6. **Launch first immersive drop** 🚀

---

**The experience is ready. The magic awaits.** ✨
