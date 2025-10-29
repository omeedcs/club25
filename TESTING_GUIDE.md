# Testing Guide - Club25

## ✅ Complete Testing Checklist

### 1. Test RSVP Flow (Without Email)

Since email might not be configured yet, here's how to test:

**Steps:**
1. Go to http://localhost:3001
2. Click "RESERVE YOUR SEAT"
3. Fill out form:
   - Name: Test User
   - Email: test@example.com
   - Phone: 555-1234
   - Dietary: Vegetarian
4. Click SUBMIT

**What to Check:**
- ✅ Terminal shows: `Confirmation code: C25-XXXX-XXXX`
- ✅ Terminal shows: `View at: http://localhost:3001/confirmation/C25-XXXX-XXXX`
- ✅ Modal shows success message
- ✅ After 3 seconds, redirects to confirmation page
- ✅ Confirmation page loads with all details

**To Access Confirmation Page:**
- Copy the code from terminal
- Visit: `http://localhost:3001/confirmation/C25-XXXX-XXXX`

---

### 2. Test Confirmation Page

**URL Pattern:** `/confirmation/[YOUR-CODE]`

**Should Show:**
- ✅ Confirmation code prominently
- ✅ Event title (Tokyo Midnight)
- ✅ Event date/time
- ✅ QR code (if confirmed)
- ✅ Other attendees list
- ✅ "View Event Details" button works

**Mobile Test:**
- ✅ Page is scrollable
- ✅ QR code is large enough
- ✅ Text is readable (16px minimum)
- ✅ Buttons are touch-friendly (44px minimum)

---

### 3. Test Mobile Experience

**Open on phone:** Use ngrok or similar to test on real device

```bash
# Install ngrok if needed
brew install ngrok

# Expose your local server
ngrok http 3001
```

**Then test on your iPhone:**

**Landing Page:**
- ✅ Logo loads quickly
- ✅ No zoom required
- ✅ ENTER button feels native (no lag)
- ✅ Haptic feedback works (vibrate on tap)
- ✅ Smooth transitions

**RSVP Modal:**
- ✅ Keyboard doesn't cause zoom
- ✅ Modal is scrollable
- ✅ Form inputs are 16px (prevents zoom)
- ✅ Submit button always visible
- ✅ Can close with X button

**Confirmation Page:**
- ✅ QR code downloads/saves
- ✅ Other guests list readable
- ✅ Scrolls smoothly

---

### 4. Test Admin Dashboard

**Access:** http://localhost:3001/admin

**Create Drop:**
1. Click "Create New Drop"
2. Fill in:
   - Title: Test Drop
   - Date: Tomorrow
   - Time: 19:00
   - Seats: 10
   - Description: Test event
   - Status: Announced
3. Click CREATE DROP
4. ✅ Redirects to drops list
5. ✅ New drop appears

**Manage Guests:**
1. Go to `/admin/guests`
2. ✅ See RSVPs you just created
3. ✅ Can search by name/email
4. ✅ Can filter by drop/status
5. ✅ Can confirm/waitlist/cancel

---

### 5. Test Prompts System

**Create Prompt:**
1. Go to `/admin/prompts`
2. Select drop
3. Select phase (e.g., Appetizer)
4. Enter text: "What's your favorite memory?"
5. Click CREATE
6. ✅ Prompt appears in list
7. ✅ Toggle shows active/inactive

**View Live:**
1. Get your confirmation code
2. Go to `/experience/C25-XXXX-XXXX`
3. ✅ Prompt appears
4. ✅ Change phase → prompt updates
5. ✅ Toggle prompt in admin → disappears from experience page

---

### 6. Test Check-In (Camera Required)

**Setup:**
1. Go to `/checkin` on tablet/phone
2. Click "START SCANNING"
3. Grant camera permission

**Test Flow:**
1. Open confirmation page on another phone
2. Show QR code to scanner
3. ✅ Scanner reads QR
4. ✅ Shows guest name + confirmation
5. ✅ Records check-in timestamp

---

### 7. Performance Tests

**Lighthouse (Chrome DevTools):**
```
Right click → Inspect → Lighthouse tab
- Performance: Should be 90+
- Accessibility: Should be 90+
- Best Practices: Should be 90+
```

**Mobile Network Throttling:**
1. DevTools → Network tab
2. Set to "Slow 3G"
3. ✅ Page still loads under 3 seconds
4. ✅ Animations don't lag
5. ✅ Form submission works

**Test on Real Device:**
- iPhone 12 or newer: Should be butter smooth
- iPhone SE / older: Should still be smooth with reduced motion

---

### 8. Database Verification

**Check Supabase:**
1. Go to your Supabase project
2. Table Editor → `rsvps`
3. ✅ New RSVP exists
4. ✅ `confirmation_code` is populated
5. ✅ `status` is correct (confirmed/waitlist)

6. Table Editor → `checkins`
7. ✅ QR code data exists
8. ✅ `scanned_at` is null (until scanned)

---

### 9. Real-Time Updates Test

**Test Prompts Live Update:**
1. Open `/experience/[code]` on Phone A
2. Open `/admin/prompts` on Phone B
3. Toggle a prompt active/inactive on Phone B
4. ✅ Phone A updates automatically (within 1-2 seconds)
5. ✅ No page refresh needed

---

### 10. Email Test (If Configured)

**If you added Resend API key:**
1. Submit RSVP
2. Check email
3. ✅ Email arrives within 30 seconds
4. ✅ Contains confirmation code
5. ✅ Contains QR code image
6. ✅ Link to confirmation page works
7. ✅ QR code is scannable from email

---

## 🐛 Common Issues & Fixes

### Issue: Confirmation page shows "Not Found"

**Fix:**
- Check the code format: Must be `C25-XXXX-XXXX`
- Check terminal for actual code generated
- Make sure you added `confirmation_code` column to database:
  ```sql
  ALTER TABLE public.rsvps 
  ADD COLUMN IF NOT EXISTS confirmation_code TEXT UNIQUE;
  ```

### Issue: Email not sending

**Fix:**
- Check `.env.local` has `RESEND_API_KEY`
- Check terminal for "Resend not configured" message
- If not configured, confirmation code still prints in terminal

### Issue: QR code doesn't scan

**Fix:**
- Make sure QR is large enough (200x200px minimum)
- Check lighting (too bright/dark affects scanning)
- Try downloading QR and scanning from photos
- Verify QR data is JSON with `type: 'checkin'`

### Issue: Mobile zoom on input focus

**Fix:**
- Already fixed! All inputs are 16px minimum
- Check `globals.css` has mobile optimizations

### Issue: Animations lag on older phones

**Fix:**
- Reduce motion is already supported
- Check `prefers-reduced-motion` system setting
- Consider disabling grain animation on low-end devices

---

## 📱 Mobile-Specific Tests

### iOS Safari
- ✅ 100vh works correctly
- ✅ No bounce scroll issues
- ✅ PWA install prompt works
- ✅ Haptic feedback vibrates

### Android Chrome
- ✅ Viewport height correct
- ✅ Back button works
- ✅ QR scanner works
- ✅ Vibration API works

### Touch Gestures
- ✅ Tap feels responsive (no 300ms delay)
- ✅ Swipe gestures don't conflict
- ✅ Pull-to-refresh disabled where needed
- ✅ Long-press doesn't select text on buttons

---

## 🎯 Production Checklist

Before going live:

- [ ] Run SQL migrations in production Supabase
- [ ] Set production env variables
- [ ] Test email sending in production
- [ ] Upload actual logo (currently using placeholder)
- [ ] Add actual drops to database
- [ ] Test RSVP flow end-to-end
- [ ] Test on multiple devices
- [ ] Run Lighthouse audit
- [ ] Test QR scanning in venue lighting
- [ ] Verify real-time updates work

---

## 📊 Expected Performance Metrics

**Page Load (3G):**
- Landing: < 2s
- Confirmation: < 1.5s
- Admin: < 2.5s

**Lighthouse Scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

**Mobile:**
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- LCP (Largest Contentful Paint): < 2.5s

---

**Happy testing! If something doesn't work, check the terminal for logs.**
