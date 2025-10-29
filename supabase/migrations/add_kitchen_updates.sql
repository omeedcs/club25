-- Kitchen Updates table for live host communications
CREATE TABLE IF NOT EXISTS public.kitchen_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id UUID REFERENCES public.drops(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'alert', 'course')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.kitchen_updates ENABLE ROW LEVEL SECURITY;

-- Guests can view updates for their drop
CREATE POLICY "Guests can view kitchen updates" ON public.kitchen_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rsvps
      WHERE rsvps.drop_id = kitchen_updates.drop_id
      AND rsvps.user_id = auth.uid()
      AND rsvps.status = 'confirmed'
    )
  );

-- Authenticated users can create kitchen updates
-- TODO: Restrict to admins once role column is added to profiles
CREATE POLICY "Authenticated users can create kitchen updates" ON public.kitchen_updates
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Index for performance
CREATE INDEX IF NOT EXISTS kitchen_updates_drop_id_idx ON public.kitchen_updates(drop_id);
CREATE INDEX IF NOT EXISTS kitchen_updates_created_at_idx ON public.kitchen_updates(created_at DESC);
