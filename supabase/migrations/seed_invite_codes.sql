-- Generate initial founder invite codes
-- These are unlimited use codes for the founder/admin to share

INSERT INTO public.invite_codes (code, user_id, max_uses, source, active) VALUES
  ('CLUB-FOUNDER', NULL, 999, 'founder', true),
  ('CLUB-VIP', NULL, 50, 'founder', true),
  ('CLUB-BETA', NULL, 25, 'founder', true);

-- Grant admin user ability to manage invite codes
-- Replace 'admin@example.com' with your actual admin email
DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- Get admin user ID (update this with your admin email)
  SELECT id INTO admin_id FROM auth.users WHERE email = 'your-email@example.com' LIMIT 1;
  
  IF admin_id IS NOT NULL THEN
    -- Create a special admin code tied to their account
    INSERT INTO public.invite_codes (code, user_id, max_uses, source, active)
    VALUES ('CLUB-ADMIN', admin_id, 999, 'admin', true)
    ON CONFLICT (code) DO NOTHING;
  END IF;
END $$;
