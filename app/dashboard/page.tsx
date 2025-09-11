'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  EyeOff, 
  Plus, 
  Calendar, 
  Gift, 
  Grid3X3,
  PieChart,
  Wallet,
  ArrowUpRight
} from 'lucide-react'
import { BottomNavigation } from '@/components/ui/bottom-navigation'

interface PortfolioData {
  totalValue: number
  totalGain: number
  totalGainPercent: number
  rdnBalance: number
  tradingBalance: number
  riskProfile: string
}

interface InvestmentProduct {
  id: string
  name: string
  type: string
  category: string
  expectedReturn: number
  minInvestment: number
  currentPrice: number
  isLive?: boolean
  quotaRemaining?: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [products, setProducts] = useState<InvestmentProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [showValues, setShowValues] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchDashboardData()
  }, [session, status])

  const fetchDashboardData = async () => {
    try {
      // Fetch portfolio data
      const portfolioResponse = await fetch(`/api/portfolio/${session?.user?.id}`)
      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json()
        setPortfolio(portfolioData)
      }

      // Fetch investment products
      const productsResponse = await fetch('/api/products')
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h1 className="text-2xl font-bold text-green-600">bibit</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs">🔔</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">52</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Portfolio Summary */}
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Nilai Portofolio</h2>
                <div className="flex items-center space-x-2">
                  {showValues ? (
                    <span className="text-2xl font-bold text-gray-900">
                      Rp {portfolio?.totalValue?.toLocaleString('id-ID') || '0'}
                    </span>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">••••••••</span>
                  )}
                  <button 
                    onClick={() => setShowValues(!showValues)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showValues ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-600">Keuntungan</span>
                  {showValues ? (
                    <span className="text-sm font-medium text-green-600">
                      +Rp {portfolio?.totalGain?.toLocaleString('id-ID') || '0'} ({portfolio?.totalGainPercent?.toFixed(2) || '0'}%)
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-green-600">••••••</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm text-gray-600">Imbal Hasil</span>
                  <span className="text-sm font-medium text-gray-900">0.00%</span>
                </div>
                <div className="text-sm text-gray-600">Saldo RDN</div>
                <div className="text-sm font-medium text-gray-900">
                  {showValues ? `Rp ${portfolio?.rdnBalance?.toLocaleString('id-ID') || '0'}` : '••••••'}
                </div>
                <div className="text-sm text-gray-600">Saldo Trading</div>
                <div className="text-sm font-medium text-gray-900">
                  {showValues ? `Rp ${portfolio?.tradingBalance?.toLocaleString('id-ID') || '0'}` : '••••••'}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="bg-green-600 hover:bg-green-700">
                Deposit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <button 
            onClick={() => router.push('/portfolio')}
            className="text-center hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <PieChart className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Portofolio</span>
          </button>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">SIP</span>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Gift className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Referral</span>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Grid3X3 className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Lainnya</span>
          </div>
        </div>

        {/* Investment Products */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🌱</span>
                </div>
                <CardTitle>Produk Investasi</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                className="text-green-600"
                onClick={() => router.push('/explore')}
              >
                Explore
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-lg">🌱</span>
                </div>
                <span className="text-sm font-medium">Reksa Dana</span>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-lg">🏠</span>
                </div>
                <span className="text-sm font-medium">SBN Retail</span>
                <div className="text-xs text-red-600 mt-1">Live</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-lg">🐦</span>
                </div>
                <span className="text-sm font-medium">Obligasi FR</span>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-lg">📈</span>
                </div>
                <span className="text-sm font-medium">Saham</span>
              </div>
            </div>

            {/* Featured Product */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-red-600 font-medium">Kuota menipis! Beli sebelum 15 Sep jam 12:00 WIB</span>
                <button className="text-red-400">×</button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">⭐</span>
                  </div>
                  <div>
                    <div className="font-medium">SR023-T3 - Imbal Hasil 5.8%</div>
                    <div className="text-sm text-gray-600">Kuota Tersisa 45.8%</div>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '45.8%' }}></div>
                    </div>
                  </div>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  Beli
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Promotion */}
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Mulai Investasi untuk Bisnis Kamu</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Daftarkan perusahaan ke Bibit Bisnis untuk investasi semudah di Bibit pribadi kamu.
                </p>
                <Button className="bg-green-600 hover:bg-green-700">
                  Pelajari lebih lanjut
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <button className="text-gray-400">×</button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
