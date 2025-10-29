import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data: drop, error } = await supabaseAdmin
      .from('drops')
      .select('*, rsvps(id, status)')
      .in('status', ['announced', 'sold_out'])
      .order('date_time', { ascending: true })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ drop: null })
      }
      throw error
    }

    // Count confirmed RSVPs
    const confirmedCount = drop.rsvps?.filter((r: any) => r.status === 'confirmed').length || 0
    const waitlistCount = drop.rsvps?.filter((r: any) => r.status === 'waitlist').length || 0

    return NextResponse.json({
      drop: {
        ...drop,
        seatsRemaining: drop.seat_limit - confirmedCount,
        totalSeats: drop.seat_limit,
        confirmedCount,
        waitlistCount
      }
    })
  } catch (error) {
    console.error('Error fetching current drop:', error)
    return NextResponse.json({ error: 'Failed to fetch drop' }, { status: 500 })
  }
}
