import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { RoleBasedNavigation } from '@/components/ui/role-based-navigation'
import { MarketSimulatorInit } from '@/components/market-simulator-init'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bibit - Investasi Mudah untuk Semua',
  description: 'Platform investasi reksa dana dan obligasi dengan edukasi keuangan untuk masyarakat Indonesia',
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
