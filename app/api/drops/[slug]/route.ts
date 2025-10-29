import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { data: drop, error } = await supabaseAdmin
      .from('drops')
      .select(`
        *,
        media(id, url, type, caption, created_at),
        rsvps(id, status)
      `)
      .eq('slug', params.slug)
      .single()

    if (error) throw error

    const confirmedCount = drop.rsvps?.filter((r: any) => r.status === 'confirmed').length || 0

    return NextResponse.json({
      drop: {
        ...drop,
        confirmedCount,
        seatsRemaining: drop.seat_limit - confirmedCount
      }
    })
  } catch (error) {
    console.error('Error fetching drop:', error)
    return NextResponse.json({ error: 'Drop not found' }, { status: 404 })
  }
}
