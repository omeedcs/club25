-- Add role column to profiles table for admin permissions
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'guest' CHECK (role IN ('guest', 'admin', 'host'));

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- Update kitchen_updates policy to restrict to admins
DROP POLICY IF EXISTS "Authenticated users can create kitchen updates" ON public.kitchen_updates;

CREATE POLICY "Admins can create kitchen updates" ON public.kitchen_updates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'host')
    )
  );
