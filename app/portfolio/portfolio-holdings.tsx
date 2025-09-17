'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react'
import { SellModal } from './sell-modal'

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

interface PortfolioHoldingsProps {
  holdings: Holding[]
}

export function PortfolioHoldings({ holdings }: PortfolioHoldingsProps) {
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null)
  const [showSellModal, setShowSellModal] = useState(false)

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

  if (holdings.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Kepemilikan Investasi
          </CardTitle>
          <CardDescription>
            Produk investasi yang Anda miliki
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada investasi</h3>
            <p className="text-gray-600 mb-4">Mulai investasi untuk melihat portfolio Anda di sini</p>
            <Button asChild>
              <a href="/investment">Mulai Investasi</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Kepemilikan Investasi
          </CardTitle>
          <CardDescription>
            {holdings.length} produk investasi dalam portfolio Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {holdings.map((holding) => (
              <div key={holding.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{holding.product.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className={getCategoryColor(holding.product.category)}>
                        {holding.product.category.replace('_', ' ')}
                      </Badge>
                      <Badge className={getRiskColor(holding.product.riskLevel)}>
                        {holding.product.riskLevel}
                      </Badge>
                      <Badge variant="outline">
                        {holding.product.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      Rp {holding.currentValue.toLocaleString('id-ID')}
                    </div>
                    <div className={`text-sm ${holding.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {holding.gain >= 0 ? '+' : ''}Rp {holding.gain.toLocaleString('id-ID')}
                      ({holding.gainPercent >= 0 ? '+' : ''}{holding.gainPercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Unit Dimiliki</div>
                    <div className="font-medium">{holding.units.toFixed(4)} unit</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Harga Rata-rata</div>
                    <div className="font-medium">Rp {holding.averagePrice.toLocaleString('id-ID')}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Harga Saat Ini</div>
                    <div className="font-medium">Rp {holding.product.currentPrice.toLocaleString('id-ID')}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Nilai Investasi</div>
                    <div className="font-medium">
                      Rp {(holding.averagePrice * holding.units).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSell(holding)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Jual
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
            window.location.reload()
          }}
        />
      )}
    </>
  )
}







