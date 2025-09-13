'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Eye,
  EyeOff,
  Flame
} from 'lucide-react'
import { BottomNavigation } from '@/components/ui/bottom-navigation'

interface PortfolioData {
  totalValue: number
  totalGain: number
  totalGainPercent: number
  riskProfile: string
  assetAllocation: {
    moneyMarket: number
    bonds: number
    stocks: number
    mixed: number
    cash: number
  }
  monthlyStreak: number
}

interface PortfolioHolding {
  id: string
  name: string
  category: string
  units: number
  currentValue: number
  gain: number
  gainPercent: number
  icon: string
}

export default function PortfolioPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [loading, setLoading] = useState(true)
  const [showValues, setShowValues] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchPortfolioData()
  }, [session, status])

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch(`/api/portfolio/${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setPortfolio(data.portfolio)
        setHoldings(data.holdings)
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error)
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
            <h1 className="text-xl font-semibold">Portofolio</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">•••</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-32">
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
                <div className="flex items-center space-x-2 mt-2">
                  {showValues ? (
                    <span className="text-sm font-medium text-green-600">
                      +{portfolio?.totalGainPercent?.toFixed(2) || '0'}%
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-green-600">••••••</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{portfolio?.riskProfile || 'Konservatif'}</span>
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs">🐰</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Allocation */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Alokasi Aset</h3>
              <div className="flex space-x-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-1">
                    <span className="text-xs text-green-600">💰</span>
                  </div>
                  <div className="text-xs text-gray-600">Pasar Uang</div>
                  <div className="text-xs font-medium">{portfolio?.assetAllocation?.moneyMarket || 0}%</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-1">
                    <span className="text-xs text-purple-600">📊</span>
                  </div>
                  <div className="text-xs text-gray-600">Obligasi</div>
                  <div className="text-xs font-medium">{portfolio?.assetAllocation?.bonds || 0}%</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-1">
                    <span className="text-xs text-blue-600">📈</span>
                  </div>
                  <div className="text-xs text-gray-600">Saham</div>
                  <div className="text-xs font-medium">{portfolio?.assetAllocation?.stocks || 0}%</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-1">
                    <span className="text-xs text-pink-600">🎯</span>
                  </div>
                  <div className="text-xs text-gray-600">Campuran</div>
                  <div className="text-xs font-medium">{portfolio?.assetAllocation?.mixed || 0}%</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-1">
                    <span className="text-xs text-orange-600">💵</span>
                  </div>
                  <div className="text-xs text-gray-600">Cash</div>
                  <div className="text-xs font-medium">{portfolio?.assetAllocation?.cash || 100}%</div>
                </div>
              </div>
            </div>

            {/* Monthly Streak */}
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-600">Monthly Streak</span>
              <span className="text-sm font-medium">{portfolio?.monthlyStreak || 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Holdings */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Portofolio</h2>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Tambah
          </Button>
        </div>

        <div className="space-y-4">
          {/* Dana Tabungan */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🦆</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Dana Tabungan</h3>
                    <p className="text-sm text-gray-600">0 Produk</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600">
                        Nilai Portofolio: {showValues ? 'Rp 0' : '••••••'}
                      </span>
                      <span className="text-sm text-gray-600">
                        Keuntungan: {showValues ? 'Rp 0' : '••••••'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dana Pensiun */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🏠</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Dana Pensiun</h3>
                    <p className="text-sm text-gray-600">0 Produk</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600">
                        Nilai Portofolio: {showValues ? 'Rp 0' : '••••••'}
                      </span>
                      <span className="text-sm text-gray-600">
                        Keuntungan: {showValues ? 'Rp 0' : '••••••'}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Robo</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bibit Saham */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">📈</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Bibit Saham</h3>
                    <p className="text-sm text-gray-600">0 Produk</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600">
                        Nilai Portofolio: {showValues ? 'Rp 0' : '••••••'}
                      </span>
                      <span className="text-sm text-gray-600">
                        Keuntungan: {showValues ? 'Rp 0' : '••••••'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
