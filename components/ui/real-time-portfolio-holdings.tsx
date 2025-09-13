'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react'
import { SellModal } from '@/app/portfolio/sell-modal'

interface Holding {
  id: string
  productId: string
  units: number
  averagePrice: number
  currentValue: number
  gain: number
  gainPercent: number
  product: {
    id: string
    name: string
    type: string
    category: string
    riskLevel: string
    currentPrice: number
  }
}

interface RealTimePortfolioHoldingsProps {
  userId: string
  className?: string
}

export function RealTimePortfolioHoldings({ userId, className = '' }: RealTimePortfolioHoldingsProps) {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null)
  const [showSellModal, setShowSellModal] = useState(false)

  const fetchHoldings = async () => {
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/portfolio/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setHoldings(data.holdings || [])
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Error fetching holdings:', error)
    } finally {
      setLoading(false)
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    fetchHoldings()
    
    // Update every 5 seconds
    const interval = setInterval(fetchHoldings, 5000)
    
    return () => clearInterval(interval)
  }, [userId])

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'KONSERVATIF':
        return 'bg-green-100 text-green-800'
      case 'MODERAT':
        return 'bg-yellow-100 text-yellow-800'
      case 'AGRESIF':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PASAR_UANG':
        return 'bg-blue-100 text-blue-800'
      case 'OBLIGASI':
        return 'bg-purple-100 text-purple-800'
      case 'CAMPURAN':
        return 'bg-orange-100 text-orange-800'
      case 'SAHAM':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSell = (holding: Holding) => {
    setSelectedHolding(holding)
    setShowSellModal(true)
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Portfolio Holdings
          </CardTitle>
          <CardDescription>Daftar investasi yang Anda miliki</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat portfolio holdings...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Portfolio Holdings
              </CardTitle>
              <CardDescription>Daftar investasi yang Anda miliki</CardDescription>
            </div>
            <div className="text-sm text-gray-500">
              {lastUpdate && `Updated: ${lastUpdate.toLocaleTimeString()}`}
              {isUpdating && (
                <span className="ml-2 text-blue-600">
                  <span className="animate-spin">⟳</span> Updating...
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {holdings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada investasi</h3>
              <p className="text-gray-600 mb-4">Mulai investasi untuk melihat portfolio Anda</p>
              <Button onClick={() => window.location.href = '/investment'}>
                Mulai Investasi
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {holdings.map((holding) => (
                <div key={holding.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{holding.product.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className={getCategoryColor(holding.product.category)}>
                          {holding.product.category.replace('_', ' ')}
                        </Badge>
                        <Badge className={getRiskColor(holding.product.riskLevel)}>
                          {holding.product.riskLevel}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        Rp {holding.currentValue?.toLocaleString('id-ID') || '0'}
                      </div>
                      <div className="text-sm text-gray-500">Nilai Saat Ini</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-gray-600">Unit</div>
                      <div className="font-medium">{holding.units?.toFixed(4) || '0'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Harga Rata-rata</div>
                      <div className="font-medium">Rp {holding.averagePrice?.toLocaleString('id-ID') || '0'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Harga Saat Ini</div>
                      <div className="font-medium">Rp {holding.product.currentPrice?.toLocaleString('id-ID') || '0'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Keuntungan</div>
                      <div className={`font-medium flex items-center gap-1 ${
                        holding.gain >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {holding.gain >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {holding.gain >= 0 ? '+' : ''}Rp {holding.gain?.toLocaleString('id-ID') || '0'}
                        ({holding.gainPercent >= 0 ? '+' : ''}{holding.gainPercent?.toFixed(2) || '0.00'}%)
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSell(holding)}
                    >
                      Jual
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showSellModal && selectedHolding && (
        <SellModal
          holding={selectedHolding}
          onClose={() => {
            setShowSellModal(false)
            setSelectedHolding(null)
          }}
          onSuccess={() => {
            setShowSellModal(false)
            setSelectedHolding(null)
            // Refresh holdings after successful sell
            fetchHoldings()
          }}
        />
      )}
    </>
  )
}
