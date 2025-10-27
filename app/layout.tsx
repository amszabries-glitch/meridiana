import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Meridiana CRM - Capital Markets Deal Management',
  description: 'Premium CRM system for Meridiana Capital Markets - Track deals, manage pipeline, and analyze performance',
  keywords: 'CRM, Capital Markets, Deal Management, Pipeline, Analytics',
  authors: [{ name: 'Meridiana Capital Markets' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
