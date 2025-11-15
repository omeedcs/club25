-- Add special CLUB-ALISHBA invite code for Austin itinerary
-- This is a special unlimited use code for Alishba's Austin trip

INSERT INTO invite_codes (code, max_uses, current_uses, active, created_at, expires_at)
VALUES (
  'CLUB-ALISHBA',
  999999, -- Essentially unlimited
  0,
  true,
  NOW(),
  '2025-12-31 23:59:59'::timestamp
)
ON CONFLICT (code) DO UPDATE SET
  active = true,
  max_uses = 999999,
  expires_at = '2025-12-31 23:59:59'::timestamp;
