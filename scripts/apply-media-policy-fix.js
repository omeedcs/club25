// Quick script to apply media upload policy fix
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const sql = `
DROP POLICY IF EXISTS "Attendees can upload media" ON public.media;

CREATE POLICY "Confirmed guests can upload media" ON public.media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rsvps
      WHERE rsvps.user_id = auth.uid()
      AND rsvps.drop_id = media.drop_id
      AND rsvps.status = 'confirmed'
    )
  );
`

const { data, error } = await supabase.rpc('exec_sql', { sql })

if (error) {
  console.error('Error:', error)
} else {
  console.log('✅ Media upload policy fixed!')
}
