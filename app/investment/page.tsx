import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { RealTimeInvestmentList } from '@/components/ui/real-time-investment-list'
import { RealTimePortfolio } from '@/components/ui/real-time-portfolio'

export default async function InvestmentPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // No need to fetch data here since we're using real-time components

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Investasi
          </h1>
          <p className="text-gray-600">
            Pilih produk investasi yang sesuai dengan profil risiko Anda
          </p>
        </div>

        {/* Portfolio Summary - Real-time */}
        <div className="mb-8">
          <RealTimePortfolio userId={session.user.id} />
        </div>

        {/* Investment Products - Real-time */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <p className="text-gray-600 text-sm">
              Pilih produk yang sesuai dengan tujuan investasi Anda
            </p>
          </div>
          <div className="p-6">
            <RealTimeInvestmentList userId={session.user.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
