import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data: drops, error } = await supabaseAdmin
      .from('drops')
      .select('*')
      .eq('status', 'completed')
      .order('date_time', { ascending: false })

    if (error) throw error

    return NextResponse.json({ drops: drops || [] })
  } catch (error) {
    console.error('Error fetching archive:', error)
    return NextResponse.json({ error: 'Failed to fetch archive' }, { status: 500 })
  }
}
