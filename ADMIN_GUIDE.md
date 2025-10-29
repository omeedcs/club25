# Club25 Admin Dashboard - Complete Guide

## 🎯 Overview
Your admin dashboard is now a comprehensive control center with real-time statistics, invite code management, analytics, and full system configuration.

## 📍 Access
Navigate to: **`/admin`**

---

## 🏠 Main Dashboard (`/admin`)

### Real-Time Statistics:
- **Total Drops** - All events created
- **Confirmed Seats** - Current confirmed RSVPs
- **Conversion Rate** - RSVP → Confirmation percentage
- **Active Invite Codes** - Currently usable codes

### Secondary Stats:
- Total check-ins
- Attendance rate (check-ins / confirmed)
- Code usage rate
- Cancelled RSVPs

### Features:
- **Real-time updates** - Auto-refreshes when new RSVPs come in
- **Recent Activity** - See latest reservations
- **Quick Actions** - Fast access to common tasks

---

## 🎟️ Drops Management (`/admin/drops`)

### View All Drops:
- See all drops with status badges
- View confirmed/waitlist counts
- Edit or view any drop
- Create new drops

### Drop Statuses:
- `draft` - Not yet announced
- `announced` - Live and accepting RSVPs
- `sold_out` - Full capacity
- `completed` - Event finished
- `cancelled` - Event cancelled

---

## 👥 Guest Lists (`/admin/guests`)

### Features:
- **Search** - Find guests by name or email
- **Filter by Drop** - View specific event guests
- **Filter by Status** - confirmed/waitlist/cancelled
- **Quick Actions:**
  - Confirm guests
  - Move to waitlist
  - Cancel RSVPs
  
### Guest Information:
- Name, email, phone
- Dietary restrictions
- RSVP status
- Which drop they're attending

---

## 🔑 Invite Codes (`/admin/invites`)

### Features:
- **Generate New Codes** - Create custom invite codes
- **View All Codes** - See usage stats for each
- **Copy to Clipboard** - Easy sharing
- **Toggle Active/Inactive** - Control code availability
- **Delete Codes** - Remove unused codes

### Code Stats:
- Total codes created
- Active codes
- Total uses across all codes
- Average usage rate

### Code Details:
- Usage progress bar
- Created date
- Expiration date
- Source (founder/admin/attendee)
- Owner information

### Creating Codes:
1. Click "Generate Code"
2. Set max uses (default: 3)
3. Choose source: admin or founder
4. Set expiry (0 = never)
5. Auto-generates format: `CLUB-XXXXXX`

---

## 📊 Analytics (`/admin/analytics`)

### Drop Performance Table:
- All drops with fill rates
- Confirmed vs waitlist numbers
- Visual progress bars
- Status indicators

### Top Invite Codes:
- Most used codes ranked
- Usage percentage
- Total invites per code

### Monthly Growth:
- RSVPs per month
- Visual bar chart
- Growth trends

### Export:
- **CSV Export** - Download all analytics
- Includes: drop, date, confirmed, waitlist, fill rate, status

---

## ⚙️ Settings (`/admin/settings`)

### General Settings:
- **Site Name** - Default: "Club25"
- **Default Seat Limit** - New drop default (25)

### RSVP Settings:
- **Auto-Approve RSVPs** - ✅ Recommended
- **Allow Waitlist** - Enable when full
- **Max Waitlist Size** - Limit waitlist (10)

### Email Notifications:
- **Send Confirmation Emails** - After RSVP
- **Send Reminder Emails** - Before event
- **Reminder Hours Before** - Timing (24h)

### Invite Code Defaults:
- **Require Invite Code** - Gate access ✅
- **Default Max Uses** - New code default (3)
- **Default Expiry** - Days until expiry (0 = never)

### Database:
- View connection info
- Export all data
- Clear test data

---

## 🗺️ Navigation

### Sidebar Menu:
- **Dashboard** - Main overview
- **Drops** - Event management
- **Guests** - RSVP lists
- **Invite Codes** - Code management
- **Analytics** - Performance insights
- **Prompts** - Conversation starters
- **Check-In** - QR scanner
- **Settings** - System config

---

## 🚀 Common Workflows

### Creating a New Drop:
1. Go to `/admin/drops`
2. Click "+ NEW DROP"
3. Fill in details
4. Set seat limit
5. Choose status (draft/announced)
6. Save

### Managing RSVPs:
1. Go to `/admin/guests`
2. Filter by drop/status
3. Search for specific guest
4. Click action buttons to:
   - Confirm
   - Waitlist
   - Cancel

### Sharing Invite Codes:
1. Go to `/admin/invites`
2. Find code or generate new
3. Click copy icon
4. Share with guests
5. Monitor usage

### Viewing Analytics:
1. Go to `/admin/analytics`
2. Review drop performance
3. Check top codes
4. View growth trends
4. Export CSV for deeper analysis

---

## 📈 Key Metrics to Track

### Conversion Rate
**Formula:** (Confirmed RSVPs / Total RSVPs) × 100

**Good:** >80%
**Average:** 60-80%
**Needs Work:** <60%

### Fill Rate per Drop
**Formula:** (Confirmed / Seat Limit) × 100

**Target:** >90% before event
**Sold Out:** 100%

### Code Usage Rate
**Formula:** (Current Uses / Max Uses) × 100

**Active Growth:** >50%
**Needs Promotion:** <30%

### Attendance Rate
**Formula:** (Check-ins / Confirmed) × 100

**Excellent:** >95%
**Good:** 85-95%
**Review:** <85%

---

## 🛡️ Security Features

### Row Level Security:
- Users only see their own data
- Admins have full access
- Invite codes validated server-side

### Data Protection:
- Service role key never exposed to client
- API routes validate all requests
- RLS policies on all tables

---

## 🔧 System Requirements

### Database Tables Used:
- `drops` - Events
- `rsvps` - Reservations
- `profiles` - User info
- `invite_codes` - Access codes
- `checkins` - Attendance
- `receipts` - Post-event mementos
- `prompts` - Conversation starters

### APIs:
- `/api/drops/*` - Drop management
- `/api/rsvp` - Reservations
- `/api/validate-invite` - Code validation

---

## 💡 Pro Tips

### Invite Code Strategy:
- **Founder codes** (999 uses) - Main distribution
- **Admin codes** (50-100 uses) - Controlled sharing
- **Attendee codes** (3 uses) - Post-event sharing

### Drop Management:
- Create as `draft` first
- Test RSVP flow
- Set to `announced` when ready
- Monitor fill rate
- Mark `completed` after event

### Guest Communication:
- Confirmation emails auto-send
- Check spam/deliverability
- Manual follow-ups from guests list
- Export for bulk emails

### Analytics Usage:
- Review weekly
- Track growth trends
- Identify top referrers
- Adjust strategy based on data

---

## 🐛 Troubleshooting

### "No data showing"
- Check Supabase connection
- Verify env variables
- Check browser console for errors

### "Invite code not working"
- Verify code is active
- Check usage limit
- Confirm not expired
- Check caps/spelling

### "RSVP not confirming"
- Check seat limit
- Verify invite code valid
- Check auto-approve setting
- Review API errors

---

## 📝 Next Steps

### Immediate:
1. ✅ Generate initial invite codes
2. ✅ Configure settings
3. ✅ Create first drop
4. ✅ Test RSVP flow

### Growth:
1. Track analytics weekly
2. Reward top referrers
3. Optimize conversion rate
4. Scale seat capacity

---

## Summary

Your admin dashboard now gives you:
- ✅ **Complete Control** - Manage every aspect
- ✅ **Real-Time Insights** - Live statistics
- ✅ **Powerful Tools** - Invite codes, export, analytics
- ✅ **Scalable System** - Ready for growth

Everything is connected, tracked, and optimized for growth! 🚀
