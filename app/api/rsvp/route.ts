import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { sendRSVPConfirmation } from '@/lib/email'
import { generateQRCode, generateConfirmationCode } from '@/lib/qr'

export async function POST(request: NextRequest) {
  try {
    const { dropSlug, name, email, phone, dietaryNotes, inviteCode } = await request.json()

    // Validate invite code
    if (!inviteCode) {
      return NextResponse.json({ error: 'Invite code required' }, { status: 400 })
    }

    const { data: codeData, error: codeError } = await supabaseAdmin
      .from('invite_codes')
      .select('*')
      .eq('code', inviteCode.toUpperCase())
      .eq('active', true)
      .maybeSingle()

    if (codeError || !codeData) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 })
    }

    if (codeData.current_uses >= codeData.max_uses) {
      return NextResponse.json({ error: 'Invite code has reached usage limit' }, { status: 400 })
    }

    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invite code has expired' }, { status: 400 })
    }

    // Get drop
    const { data: drop, error: dropError } = await supabaseAdmin
      .from('drops')
      .select('*')
      .eq('slug', dropSlug)
      .eq('status', 'announced')
      .maybeSingle()

    if (dropError || !drop) {
      return NextResponse.json({ error: 'Drop not available' }, { status: 400 })
    }

    // Check capacity
    const { count: confirmedCount } = await supabaseAdmin
      .from('rsvps')
      .select('*', { count: 'exact', head: true })
      .eq('drop_id', drop.id)
      .eq('status', 'confirmed')

    const status = (confirmedCount || 0) < drop.seat_limit ? 'confirmed' : 'waitlist'

    // Create or get user
    let userId: string

    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingUser) {
      userId = existingUser.id
      console.log('📝 Using existing user:', userId)
    } else {
      console.log('👤 Creating new user for:', email)
      // Create auth user
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
      })

      if (authError) {
        console.error('❌ Auth user creation failed:', authError)
        throw authError
      }
      userId = authUser.user.id
      console.log('✅ Auth user created:', userId)

      // Create profile with invite tracking
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({ 
          id: userId, 
          email, 
          name, 
          phone,
          invited_by_code: inviteCode.toUpperCase()
        })
      
      if (profileError) {
        console.error('❌ Profile creation failed:', profileError)
        throw profileError
      }
      console.log('✅ Profile created')
    }

    // Check if RSVP already exists
    const { data: existingRSVP } = await supabaseAdmin
      .from('rsvps')
      .select('*')
      .eq('user_id', userId)
      .eq('drop_id', drop.id)
      .maybeSingle()

    if (existingRSVP) {
      return NextResponse.json({ 
        error: 'You already have an RSVP for this drop',
        status: existingRSVP.status
      }, { status: 400 })
    }

    // Generate confirmation code and QR
    const confirmationCode = generateConfirmationCode()
    const qrData = JSON.stringify({
      code: confirmationCode,
      userId,
      dropId: drop.id,
      type: 'checkin'
    })
    const qrCodeDataURL = await generateQRCode(qrData)
    console.log('🎫 QR Code generated, length:', qrCodeDataURL.length, 'Preview:', qrCodeDataURL.substring(0, 50) + '...')

    // Create RSVP with invite code tracking
    const { data: rsvp, error: rsvpError } = await supabaseAdmin
      .from('rsvps')
      .insert({
        user_id: userId,
        drop_id: drop.id,
        status,
        dietary_notes: dietaryNotes,
        confirmation_code: confirmationCode,
        used_invite_code: inviteCode.toUpperCase()
      })
      .select()
      .single()

    if (rsvpError) throw rsvpError
    
    // Increment invite code usage
    await supabaseAdmin
      .from('invite_codes')
      .update({ current_uses: codeData.current_uses + 1 })
      .eq('id', codeData.id)
    
    console.log('✅ RSVP created successfully:', { rsvpId: rsvp.id, confirmationCode, status })

    // Create check-in record (for QR code storage)
    const { data: checkinData, error: checkinError } = await supabaseAdmin
      .from('checkins')
      .insert({
        user_id: userId,
        drop_id: drop.id,
        qr_code: qrCodeDataURL
      })
      .select()
      .single()
    
    if (checkinError) {
      console.error('❌ Checkin creation failed:', checkinError)
    } else {
      console.log('✅ Check-in record created with QR code')
    }

    // Send confirmation email (only if Resend is configured)
    console.log('📧 Checking email configuration...')
    console.log('RESEND_API_KEY present:', !!process.env.RESEND_API_KEY)
    
    if (process.env.RESEND_API_KEY) {
      console.log('✉️  Attempting to send email to:', email)
      try {
        const emailResult = await sendRSVPConfirmation({
          to: email,
          name,
          dropTitle: drop.title,
          dropDate: new Date(drop.date_time).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          }),
          status,
          confirmationCode
        })
        console.log('✅ Email sent successfully:', emailResult)
      } catch (emailError) {
        console.error('❌ Email error:', emailError)
        // Don't fail the RSVP if email fails
      }
    } else {
      console.log('⚠️  Resend not configured - skipping email')
      console.log('📋 Confirmation code:', confirmationCode)
      console.log('🔗 View at:', `${process.env.NEXT_PUBLIC_APP_URL}/confirmation/${confirmationCode}`)
    }

    // Update drop status if sold out
    if (status === 'waitlist') {
      await supabaseAdmin
        .from('drops')
        .update({ status: 'sold_out' })
        .eq('id', drop.id)
    }

    return NextResponse.json({ 
      rsvpId: rsvp.id, 
      confirmationCode,
      status,
      message: status === 'confirmed' 
        ? 'Your seat is confirmed! Check your email for details.'
        : 'You\'re on the waitlist. We\'ll notify you if a spot opens.'
    })

  } catch (error) {
    console.error('RSVP error:', error)
    return NextResponse.json({ error: 'Failed to create RSVP' }, { status: 500 })
  }
}
