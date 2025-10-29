// Beautiful, mobile-optimized email templates for Club25

const BRAND = {
  colors: {
    blue: '#004aad',
    gold: '#D4AF37',
    cream: '#fffcf7',
    charcoal: '#1E1E1E',
    lilac: '#4a3e8e',
    gray: '#B8B8B8',
  },
  fonts: {
    serif: "Georgia, 'Times New Roman', serif",
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Courier New', monospace",
  }
}

// Base email wrapper for consistency
export function emailWrapper(content: string, preheader: string = '') {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <!--<![endif]-->
  <title>Club25</title>
  <style type="text/css">
    @media only screen and (max-width: 600px) {
      .mobile-padding { padding: 24px !important; }
      .mobile-text { font-size: 14px !important; line-height: 1.6 !important; }
      .mobile-heading { font-size: 24px !important; }
      .mobile-button { padding: 16px 32px !important; font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.colors.blue}; font-family: ${BRAND.fonts.sans};">
  <!-- Preheader (hidden preview text) -->
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden; opacity: 0; mso-hide: all;">${preheader}</div>` : ''}
  
  <!-- Spacer for better preview -->
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; mso-hide: all;">&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
  
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${BRAND.colors.blue};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Main container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <h1 style="margin: 0; font-size: 48px; font-weight: 400; color: ${BRAND.colors.cream}; letter-spacing: 6px; font-family: ${BRAND.fonts.serif}; line-height: 1;">
                Club25
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 10px; letter-spacing: 3px; color: ${BRAND.colors.gold}; font-weight: bold;">INVITATION ONLY</p>
            </td>
          </tr>
          
          <!-- Content card -->
          <tr>
            <td class="mobile-padding" style="background-color: ${BRAND.colors.charcoal}; padding: 40px; border-radius: 8px; border: 1px solid ${BRAND.colors.lilac};">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="margin: 0; font-size: 12px; color: ${BRAND.colors.cream}; opacity: 0.6; line-height: 1.6;">
                Questions? Reply to this email.<br/>
                <span style="color: ${BRAND.colors.gold};">—</span> The Club25 Team
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

// Primary CTA button
export function buttonPrimary(text: string, url: string) {
  return `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
  <tr>
    <td align="center">
      <a href="${url}" style="display: inline-block; padding: 18px 48px; background-color: ${BRAND.colors.gold}; color: ${BRAND.colors.charcoal}; text-decoration: none; font-weight: bold; font-size: 15px; letter-spacing: 2px; border-radius: 6px; font-family: ${BRAND.fonts.sans}; text-transform: uppercase;">
        ${text}
      </a>
    </td>
  </tr>
</table>
  `
}

// Secondary button (outlined)
export function buttonSecondary(text: string, url: string) {
  return `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
  <tr>
    <td align="center">
      <a href="${url}" style="display: inline-block; padding: 14px 36px; background-color: transparent; color: ${BRAND.colors.cream}; text-decoration: none; font-size: 14px; letter-spacing: 1px; border: 2px solid ${BRAND.colors.lilac}; border-radius: 6px; font-family: ${BRAND.fonts.sans};">
        ${text}
      </a>
    </td>
  </tr>
</table>
  `
}

// Confirmation code box
export function confirmationCodeBox(code: string) {
  return `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
  <tr>
    <td style="background: linear-gradient(135deg, ${BRAND.colors.blue} 0%, #002f73 100%); padding: 32px; text-align: center; border-radius: 8px; border: 2px solid ${BRAND.colors.gold};">
      <p style="margin: 0 0 12px 0; font-size: 11px; letter-spacing: 3px; color: ${BRAND.colors.gold}; font-weight: bold; text-transform: uppercase;">
        Your Confirmation Code
      </p>
      <p style="margin: 0; font-size: 40px; font-family: ${BRAND.fonts.mono}; font-weight: bold; color: ${BRAND.colors.gold}; letter-spacing: 4px; line-height: 1.2;">
        ${code}
      </p>
    </td>
  </tr>
</table>
  `
}

// Info box (for tips, warnings, etc)
export function infoBox(icon: string, title: string, text: string) {
  return `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
  <tr>
    <td style="background-color: rgba(212, 175, 55, 0.1); padding: 24px; border-radius: 6px; border-left: 4px solid ${BRAND.colors.gold};">
      <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: ${BRAND.colors.gold};">
        ${icon} ${title}
      </p>
      <p style="margin: 0; font-size: 14px; color: ${BRAND.colors.gray}; line-height: 1.6;">
        ${text}
      </p>
    </td>
  </tr>
</table>
  `
}

// Divider line
export function divider() {
  return `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
  <tr>
    <td style="border-top: 1px solid ${BRAND.colors.lilac}; opacity: 0.3;"></td>
  </tr>
</table>
  `
}

// Status badge
export function statusBadge(status: 'confirmed' | 'waitlist') {
  const config = {
    confirmed: { icon: '✓', text: 'CONFIRMED', color: BRAND.colors.gold },
    waitlist: { icon: '⏱', text: 'WAITLIST', color: BRAND.colors.lilac },
  }
  const badge = config[status]
  
  return `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
  <tr>
    <td style="background-color: rgba(212, 175, 55, 0.15); padding: 8px 16px; border-radius: 20px; display: inline-block;">
      <p style="margin: 0; font-size: 11px; letter-spacing: 2px; color: ${badge.color}; font-weight: bold;">
        ${badge.icon} ${badge.text}
      </p>
    </td>
  </tr>
</table>
  `
}
