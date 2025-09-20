import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { RoleBasedNavigation } from '@/components/ui/role-based-navigation'
import { MarketSimulatorInit } from '@/components/market-simulator-init'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinEdu - Platform Edukasi Keuangan',
  description: 'Platform edukasi keuangan dan investasi untuk masyarakat Indonesia dengan simulasi pasar real-time',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            {children}
            <RoleBasedNavigation />
            <MarketSimulatorInit />
          </div>
        </Providers>
      </body>
    </html>
  )
}
