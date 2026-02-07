import './globals.css'
import type { Metadata } from 'next'
import { QueryProvider } from '@/providers/QueryProvider'

export const metadata: Metadata = {
  title: 'TiKiT OS - Campaign Execution & Intelligence',
  description: 'Enterprise-grade operating system for influencer marketing agencies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
