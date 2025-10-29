# Guest Journey - Complete Flow

## 📍 The Full Experience

### 1. Discovery → RSVP (Website)

**Guest Action:**
- Lands on club25.co
- Sees current drop
- Clicks "RESERVE YOUR SEAT"
- Fills out form (name, email, phone, dietary notes)
- Submits

**What Happens:**
- RSVP saved to database
- Confirmation code generated (e.g., `C25-A7K9-M3P2`)
- QR code created with encrypted check-in data
- Email sent with:
  - Confirmation code
  - QR code image
  - Link to confirmation page
- User redirected to `/confirmation/[code]`

**Status Options:**
- **Confirmed** - Seat secured
- **Waitlist** - Event is full, priority waiting list

---

### 2. Confirmation Page

**URL:** `/confirmation/C25-XXXX-XXXX`

**Guest Sees:**
- ✅ Confirmation status
- 📅 Event details (date, time, location hint)
- 🎫 Their unique confirmation code
- 📱 QR code for check-in (if confirmed)
- 👥 Other attendees (first names only)
- 📧 Dietary notes reminder

**Available Actions:**
- View event details
- Save QR code to phone
- See who else is coming

---

### 3. Pre-Event (24 Hours Before)

**Automated Email Sent:**
- Final reminder
- Full address revealed
- Parking instructions
- What to expect
- QR code reminder

**Guest Can:**
- View confirmation page anytime
- Access their dashboard at `/my/drops`

---

### 4. Arrival (At Venue)

**Check-In Flow:**

1. **Guest arrives** at location
2. **Host opens** `/checkin` on tablet/phone
3. **Guest shows** QR code (on phone or printed)
4. **Host scans** QR code
5. **System confirms:**
   - ✅ Name
   - ✅ Event
   - ✅ Confirmation code
   - ✅ Updates database (`scanned_at` timestamp)
6. **Guest welcomed** - check-in complete

**What Happens:**
- Attendance recorded
- Receipt eligibility triggered
- Guest added to "currently here" list

---

### 5. During Event (Immersive Experience)

**Guest accesses:** `/experience/C25-XXXX-XXXX`

**They See:**

**Real-time Interface:**
- Current course phase (Arrival → Appetizer → Main → Dessert)
- **Active conversation prompt** for current phase
  - Example: "What meal changed your life?"
  - Updates automatically when host changes phases
- **Who's at the table** (all confirmed guests)
  - First name + profile initial
  - Grid of attendees
- Ambient music player
- Animated, immersive UI

**Host Controls:**
- Admin can activate/deactivate prompts in real-time
- Prompts change per course phase
- All guests' screens update simultaneously via Supabase real-time

**Example Flow:**
```
7:00 PM - ARRIVAL
Prompt: "If you could have dinner with anyone, who?"

7:30 PM - APPETIZER
Prompt: "What's a risk you took that changed everything?"

8:15 PM - MAIN COURSE
Prompt: "Describe your perfect day in 5 words"

9:30 PM - DESSERT
Prompt: "What are you grateful for tonight?"
```

---

### 6. Post-Event (Next Day)

**Automated Email:**
- Thank you message
- **Digital receipt code** (e.g., `C25-TOKYO-2024`)
  - Saved to `receipts` table
  - Permanent memento
- Link to photo gallery
- Invitation to upload their photos

**Guest Dashboard:** `/my/drops`
- View all past drops attended
- Collection of digital receipts
- Photo galleries
- Upcoming RSVPs

---

## 🎯 User Touchpoints

| Touchpoint | URL | Purpose |
|------------|-----|---------|
| **Landing Page** | `/` | Discovery, current drop info |
| **RSVP Modal** | (Modal) | Reserve seat |
| **Confirmation** | `/confirmation/[code]` | View RSVP details, QR code |
| **User Dashboard** | `/my/drops` | View all RSVPs & receipts |
| **Login** | `/login` | Magic link sign-in |
| **Check-In** | `/checkin` | Host scans QR codes |
| **Live Experience** | `/experience/[code]` | During-event immersive UI |
| **Drop Details** | `/drop/[slug]` | Individual event page + gallery |

---

## 🔐 Security & Privacy

### Confirmation Codes
- Format: `C25-XXXX-XXXX`
- Unique per RSVP
- Cannot be guessed
- Required for all guest features

### QR Codes
- Contains encrypted JSON:
  ```json
  {
    "code": "C25-XXXX-XXXX",
    "userId": "uuid",
    "dropId": "uuid",
    "type": "checkin"
  }
  ```
- Only scannable by host check-in system
- Validates against database

### Data Sharing
- Guests only see **first names** of other attendees
- No emails, phones, or full names shared
- Dietary notes private to admin only

---

## 📧 Email Touchpoints

1. **RSVP Confirmation**
   - Sent: Immediately after RSVP
   - Contains: Confirmation code, QR code, event details

2. **Check-in Reminder** (24h before)
   - Sent: Automated
   - Contains: Address, parking, QR code reminder

3. **Waitlist Alert** (if spot opens)
   - Sent: Immediately when confirmed guest cancels
   - Contains: 24-hour claim window

4. **Post-Event Recap**
   - Sent: Day after event
   - Contains: Digital receipt, gallery link, thank you

---

## 🎨 Admin Controls

### Before Event:
- Create drop
- Set capacity
- Write conversation prompts
- Approve/reject RSVPs
- Manage waitlist

### During Event:
- Check in guests via QR scan
- Change active prompt per course
- Monitor who's present

### After Event:
- Upload photos
- Approve guest-uploaded photos
- Generate receipts
- Send recap email

---

## 💾 Database Records

For each guest:
```
profiles → User info
  ├── rsvps → Reservation + confirmation code
  ├── checkins → QR code + scanned_at timestamp
  ├── receipts → Digital memento code
  └── keys → Membership tier (future)
```

---

## 🚀 Future Enhancements

- [ ] SMS notifications
- [ ] Guest-to-guest messaging (opt-in)
- [ ] Photo booth integration
- [ ] Spotify playlist sharing
- [ ] Membership tier upgrades
- [ ] Surprise "wildcard" prompts
- [ ] Post-event connection platform

---

**Every touchpoint is designed to feel intentional, cinematic, and exclusive.**
