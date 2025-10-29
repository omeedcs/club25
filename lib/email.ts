import { Resend } from 'resend'
import {
  emailWrapper,
  buttonPrimary,
  buttonSecondary,
  confirmationCodeBox,
  infoBox,
  divider,
  statusBadge
} from './email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'Club25 <hello@club25.co>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Send RSVP Confirmation Email
 * Beautiful, mobile-optimized confirmation with direct ticket link
 */
export async function sendRSVPConfirmation({
  to,
  name,
  dropTitle,
  dropDate,
  status,
  confirmationCode,
}: {
  to: string
  name: string
  dropTitle: string
  dropDate: string
  status: 'confirmed' | 'waitlist'
  confirmationCode: string
}) {
  const isConfirmed = status === 'confirmed'
  
  const subject = isConfirmed 
    ? `✓ You're in: ${dropTitle}`
    : `On waitlist: ${dropTitle}`

  const preheader = isConfirmed
    ? `Code ${confirmationCode} • Tap to view your ticket with QR code`
    : `We'll notify you immediately if a seat opens`

  const ticketUrl = `${APP_URL}/my-ticket?code=${confirmationCode}`

  const content = `
    ${statusBadge(status)}
    
    <h2 style="margin: 0 0 16px 0; font-size: 32px; font-weight: 400; color: #fffcf7; line-height: 1.2; font-family: Georgia, 'Times New Roman', serif;">
      ${dropTitle}
    </h2>
    
    <p style="margin: 0 0 24px 0; font-size: 16px; color: #B8B8B8; line-height: 1.5;">
      ${dropDate}
    </p>
    
    ${isConfirmed ? `
      <p style="margin: 0 0 24px 0; font-size: 16px; color: #fffcf7; line-height: 1.7;">
        ${name}, your seat is confirmed.
      </p>
      
      <p style="margin: 0 0 32px 0; font-size: 15px; color: #B8B8B8; line-height: 1.7;">
        This isn't just dinner—it's a curated experience. 25 seats. One night. Come ready to connect, taste, and discover something unexpected.
      </p>
      
      ${confirmationCodeBox(confirmationCode)}
      
      ${infoBox('📱', 'Your QR Code is Ready', 'Tap the button below to access your ticket. Show the QR code at the door for instant check-in. Save it to your phone—it works offline.')}
      
      ${buttonPrimary('View Ticket & QR Code', ticketUrl)}
      
      ${divider()}
      
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 24px; background-color: rgba(0, 74, 173, 0.2); border-radius: 6px; border-left: 3px solid #D4AF37;">
            <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #D4AF37;">
              What to expect:
            </p>
            <p style="margin: 0; font-size: 14px; color: #B8B8B8; line-height: 1.6;">
              • Location revealed 24 hours before<br/>
              • Dress code: Smart casual<br/>
              • Doors open 15 minutes early<br/>
              • Dietary restrictions accommodated
            </p>
          </td>
        </tr>
      </table>
      
      <p style="margin: 32px 0 0 0; font-size: 13px; color: #888; line-height: 1.6; text-align: center;">
        See you soon.<br/>
        <span style="color: #D4AF37;">—</span> Club25
      </p>
    ` : `
      <p style="margin: 0 0 24px 0; font-size: 16px; color: #fffcf7; line-height: 1.7;">
        ${name}, we're at capacity right now.
      </p>
      
      <p style="margin: 0 0 32px 0; font-size: 15px; color: #B8B8B8; line-height: 1.7;">
        You're on our priority waitlist. If someone cancels, you'll be the first to know. We'll send you an instant notification with 24 hours to claim your seat.
      </p>
      
      ${confirmationCodeBox(confirmationCode)}
      
      ${infoBox('⏱', 'You&rsquo;re on the list', 'Keep this confirmation code. If a seat opens, you&rsquo;ll need it to complete your RSVP.')}
      
      <p style="margin: 32px 0 0 0; font-size: 13px; color: #888; line-height: 1.6; text-align: center;">
        We'll keep you posted.<br/>
        <span style="color: #D4AF37;">—</span> Club25
      </p>
    `}
  `

  const html = emailWrapper(content, preheader)

  return await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  })
}

/**
 * Send 24h Check-in Reminder
 * Includes location reveal and QR code link
 */
export async function sendCheckInReminder({
  to,
  name,
  dropTitle,
  dropDate,
  dropLocation,
  confirmationCode,
}: {
  to: string
  name: string
  dropTitle: string
  dropDate: string
  dropLocation: string
  confirmationCode: string
}) {
  const subject = `🌃 Tomorrow: ${dropTitle}`
  const preheader = `Location revealed: ${dropLocation}. Your QR code is ready.`
  const ticketUrl = `${APP_URL}/my-ticket?code=${confirmationCode}`

  const content = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td style="background-color: rgba(212, 175, 55, 0.15); padding: 8px 16px; border-radius: 20px;">
          <p style="margin: 0; font-size: 11px; letter-spacing: 2px; color: #D4AF37; font-weight: bold;">
            🌃 TOMORROW NIGHT
          </p>
        </td>
      </tr>
    </table>
    
    <h2 style="margin: 0 0 16px 0; font-size: 32px; font-weight: 400; color: #fffcf7; line-height: 1.2; font-family: Georgia, 'Times New Roman', serif;">
      ${dropTitle}
    </h2>
    
    <p style="margin: 0 0 8px 0; font-size: 16px; color: #B8B8B8;">
      ${dropDate}
    </p>
    
    <p style="margin: 0 0 32px 0; font-size: 20px; font-weight: bold; color: #D4AF37;">
      📍 ${dropLocation}
    </p>
    
    <p style="margin: 0 0 24px 0; font-size: 16px; color: #fffcf7; line-height: 1.7;">
      ${name}, it's happening tomorrow.
    </p>
    
    <p style="margin: 0 0 32px 0; font-size: 15px; color: #B8B8B8; line-height: 1.7;">
      The location is unlocked above. Your QR code for check-in is ready. Just show it when you arrive—no printed ticket needed.
    </p>
    
    ${buttonPrimary('View QR Code', ticketUrl)}
    
    ${divider()}
    
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding: 24px; background-color: rgba(0, 74, 173, 0.2); border-radius: 6px;">
          <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold; color: #fffcf7;">
            Arrival details:
          </p>
          <p style="margin: 0; font-size: 14px; color: #B8B8B8; line-height: 1.8;">
            • Doors open 15 minutes before start time<br/>
            • Have your QR code ready<br/>
            • Smart casual dress code<br/>
            • Be ready for something special
          </p>
        </td>
      </tr>
    </table>
    
    <p style="margin: 32px 0 0 0; font-size: 13px; color: #888; line-height: 1.6; text-align: center;">
      See you tomorrow.<br/>
      <span style="color: #D4AF37;">—</span> Club25
    </p>
  `

  const html = emailWrapper(content, preheader)

  return await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  })
}

/**
 * Send Waitlist Alert
 * When a seat opens up
 */
export async function sendWaitlistAlert({
  to,
  name,
  dropTitle,
  dropDate,
  confirmationCode,
}: {
  to: string
  name: string
  dropTitle: string
  dropDate: string
  confirmationCode: string
}) {
  const subject = `🎉 A seat opened: ${dropTitle}`
  const preheader = `You have 24 hours to claim your seat. Don't miss it!`
  const claimUrl = `${APP_URL}/my-ticket?code=${confirmationCode}`

  const content = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td style="background: linear-gradient(135deg, #D4AF37 0%, #f4d784 100%); padding: 12px 20px; border-radius: 20px;">
          <p style="margin: 0; font-size: 12px; letter-spacing: 2px; color: #1E1E1E; font-weight: bold;">
            🎉 SEAT AVAILABLE
          </p>
        </td>
      </tr>
    </table>
    
    <h2 style="margin: 0 0 16px 0; font-size: 32px; font-weight: 400; color: #fffcf7; line-height: 1.2; font-family: Georgia, 'Times New Roman', serif;">
      ${dropTitle}
    </h2>
    
    <p style="margin: 0 0 32px 0; font-size: 16px; color: #B8B8B8;">
      ${dropDate}
    </p>
    
    <p style="margin: 0 0 24px 0; font-size: 18px; font-weight: bold; color: #fffcf7; line-height: 1.5;">
      ${name}, you're off the waitlist.
    </p>
    
    <p style="margin: 0 0 32px 0; font-size: 15px; color: #B8B8B8; line-height: 1.7;">
      A seat just opened and it's yours—but you need to claim it within the next 24 hours or it goes to the next person on the list.
    </p>
    
    ${infoBox('⏰', '24-Hour Window', 'Claim your seat now. After 24 hours, this spot will be offered to someone else.')}
    
    ${buttonPrimary('Claim My Seat', claimUrl)}
    
    ${buttonSecondary('View Event Details', `${APP_URL}/drop/${dropTitle.toLowerCase().replace(/\s+/g, '-')}`)}
    
    <p style="margin: 32px 0 0 0; font-size: 13px; color: #888; line-height: 1.6; text-align: center;">
      Don't wait—claim it now.<br/>
      <span style="color: #D4AF37;">—</span> Club25
    </p>
  `

  const html = emailWrapper(content, preheader)

  return await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  })
}

/**
 * Send Post-Event Recap
 * After the event with photos and memories
 */
export async function sendRecap({
  to,
  name,
  dropTitle,
  galleryUrl,
  quotes,
}: {
  to: string
  name: string
  dropTitle: string
  galleryUrl: string
  quotes: string[]
}) {
  const subject = `✨ Last night: ${dropTitle}`
  const preheader = `Relive the moments. View photos and share your favorites.`

  const content = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td style="background-color: rgba(212, 175, 55, 0.15); padding: 8px 16px; border-radius: 20px;">
          <p style="margin: 0; font-size: 11px; letter-spacing: 2px; color: #D4AF37; font-weight: bold;">
            ✨ LAST NIGHT
          </p>
        </td>
      </tr>
    </table>
    
    <h2 style="margin: 0 0 32px 0; font-size: 32px; font-weight: 400; color: #fffcf7; line-height: 1.2; font-family: Georgia, 'Times New Roman', serif;">
      ${dropTitle}
    </h2>
    
    <p style="margin: 0 0 32px 0; font-size: 16px; color: #fffcf7; line-height: 1.7;">
      ${name}, last night was something special.
    </p>
    
    ${quotes.length > 0 ? `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
        ${quotes.slice(0, 3).map(quote => `
          <tr>
            <td style="padding: 20px; margin-bottom: 16px; background-color: rgba(74, 62, 142, 0.2); border-left: 3px solid #D4AF37; border-radius: 4px;">
              <p style="margin: 0; font-size: 15px; font-style: italic; color: #B8B8B8; line-height: 1.6;">
                "${quote}"
              </p>
            </td>
          </tr>
        `).join('')}
      </table>
    ` : ''}
    
    <p style="margin: 32px 0; font-size: 15px; color: #B8B8B8; line-height: 1.7;">
      The photos from last night are now live. View the gallery, download your favorites, and share your own moments from the evening.
    </p>
    
    ${buttonPrimary('View Photo Gallery', galleryUrl)}
    
    ${divider()}
    
    <p style="margin: 32px 0 0 0; font-size: 14px; color: #888; line-height: 1.7; text-align: center;">
      The next drop is coming soon.<br/>
      You'll be the first to know.<br/><br/>
      <span style="color: #D4AF37;">—</span> Club25
    </p>
  `

  const html = emailWrapper(content, preheader)

  return await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  })
}
