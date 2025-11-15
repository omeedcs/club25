import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || code.length < 4) {
      return NextResponse.json({ error: 'Invalid code format' }, { status: 400 })
    }

    const upperCode = code.toUpperCase()

    // Special handling for Alishba's Austin itinerary code
    if (upperCode === 'CLUB-ALISHBA') {
      return NextResponse.json({ 
        valid: true,
        code: upperCode,
        redirectTo: '/austin-alishba'
      })
    }

    // Check if code exists and is valid
    const { data: inviteCode, error } = await supabaseAdmin
      .from('invite_codes')
      .select('*')
      .eq('code', upperCode)
      .eq('active', true)
      .maybeSingle()

    if (error || !inviteCode) {
      return NextResponse.json({ error: 'Invalid or expired invite code' }, { status: 400 })
    }

    // Check if code has uses remaining
    if (inviteCode.current_uses >= inviteCode.max_uses) {
      return NextResponse.json({ error: 'This code has reached its usage limit' }, { status: 400 })
    }

    // Check if code has expired
    if (inviteCode.expires_at && new Date(inviteCode.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This code has expired' }, { status: 400 })
    }

    return NextResponse.json({ 
      valid: true,
      code: inviteCode.code 
    })

  } catch (error) {
    console.error('Invite validation error:', error)
    return NextResponse.json({ error: 'Failed to validate code' }, { status: 500 })
  }
}
