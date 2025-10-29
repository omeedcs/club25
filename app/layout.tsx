import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Club25 — Invitation Only',
  description: 'An intimate supper club. 25 seats. One secret location. Every two weeks, a new chapter unfolds in Dallas.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Club25',
  },
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: 'Club25 — You\'ve Been Invited',
    description: 'An intimate dining experience. 25 seats. One secret location.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#004aad',
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://klwxwprpmiddcfobxjpg.supabase.co" />
        <link rel="dns-prefetch" href="https://klwxwprpmiddcfobxjpg.supabase.co" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={inter.className}>
        <div className="film-grain"></div>
        {children}
      </body>
    </html>
  )
}
