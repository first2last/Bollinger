import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bollinger Bands Indicator - KLineCharts',
  description: 'Production-ready Bollinger Bands indicator built with KLineCharts, React, Next.js, and TypeScript',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-900 text-white antialiased">
        {children}
      </body>
    </html>
  )
}