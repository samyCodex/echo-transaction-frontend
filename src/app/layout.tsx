import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'

if (process.env.NODE_ENV === 'development') {
  import('@/lib/api-test')
}

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Echo Transaction',
  description: 'Secure transaction management platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
