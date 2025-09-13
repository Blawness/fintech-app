import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { InvestmentProductsList } from './investment-products-list'

export default async function InvestmentPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Get user's portfolio
  const portfolio = await prisma.portfolio.findUnique({
    where: { userId: session.user.id },
    include: {
      holdings: {
        include: {
          product: true
        }
      }
    }
  })

  // Get all active investment products
  const products = await prisma.investmentProduct.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  })

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

        {/* Portfolio Summary */}
        {portfolio && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Anda</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  Rp {portfolio.totalValue.toLocaleString('id-ID')}
                </div>
                <div className="text-sm text-gray-600">Total Nilai</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${portfolio.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolio.totalGain >= 0 ? '+' : ''}Rp {portfolio.totalGain.toLocaleString('id-ID')}
                </div>
                <div className="text-sm text-gray-600">Keuntungan</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${portfolio.totalGainPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolio.totalGainPercent >= 0 ? '+' : ''}{portfolio.totalGainPercent.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-600">Return</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {portfolio.holdings.length}
                </div>
                <div className="text-sm text-gray-600">Produk</div>
              </div>
            </div>
          </div>
        )}

        {/* Investment Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Produk Investasi Tersedia</h2>
            <p className="text-gray-600 text-sm mt-1">
              Pilih produk yang sesuai dengan tujuan investasi Anda
            </p>
          </div>
          <div className="p-6">
            <InvestmentProductsList 
              products={products} 
              portfolio={portfolio}
              userId={session.user.id}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
