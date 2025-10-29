import QRCode from 'qrcode'

export async function generateQRCode(text: string): Promise<string> {
  try {
    const qrDataURL = await QRCode.toDataURL(text, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1E1E1E',
        light: '#F9F7F3'
      }
    })
    return qrDataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw error
  }
}

export function generateConfirmationCode(): string {
  // Format: C25-XXXX-XXXX
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `C25-${part1}-${part2}`
}
