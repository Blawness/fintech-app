'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AssetBuySlider } from '@/components/ui/asset-buy-slider'
import FinalV5Chart from '@/components/ui/final-v5-chart'
import { SimpleChart } from '@/components/ui/simple-chart'
import { X, DollarSign, TrendingUp, BarChart3, Wallet } from 'lucide-react'

// Utility function for consistent rounding
const roundToDecimals = (value: number, decimals: number = 4): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

interface Product {
  id: string
  name: string
  type: string
  category: string
  riskLevel: string
  expectedReturn: number
  minInvestment: number
  currentPrice: number
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Portfolio {
  id: string
  userId: string
  totalValue: number
  totalGain: number
  totalGainPercent: number
  riskProfile: string
  rdnBalance: number
  tradingBalance: number
  holdings: {
    id: string;
    productId: string;
    units: number;
    averagePrice: number;
    product: {
      name: string;
      currentPrice: number;
    };
  }[]
}

interface InvestmentModalProps {
  product: Product
  userId: string
  portfolio: Portfolio | null
  onClose: () => void
  onSuccess: () => void
}

export function InvestmentModal({ product, userId, portfolio, onClose, onSuccess }: InvestmentModalProps) {
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'chart' | 'invest'>('chart')

  const minAmount = roundToDecimals(product.minInvestment, 2)
  const currentPrice = roundToDecimals(product.currentPrice, 2)
  const units = amount > 0 ? roundToDecimals(amount / currentPrice, 4) : 0
  const availableBalance = portfolio?.rdnBalance || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Use tolerance for floating-point comparison
    const tolerance = 0.01
    const roundedAmount = roundToDecimals(amount, 2)
    
    if (roundedAmount < (minAmount - tolerance)) {
      setError(`Minimum investasi adalah Rp ${minAmount.toLocaleString('id-ID')}`)
      setLoading(false)
      return
    }

    if (roundedAmount > (availableBalance + tolerance)) {
      setError(`Saldo tidak mencukupi. Saldo tersedia: Rp ${availableBalance.toLocaleString('id-ID')}`)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/investment/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          amount: roundedAmount
        })
      })

      if (response.ok) {
        onSuccess()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Terjadi kesalahan saat melakukan investasi')
      }
    } catch (error) {
      console.error('Error investing:', error)
      setError('Terjadi kesalahan saat melakukan investasi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{product.name}</CardTitle>
              <CardDescription>Analisis dan Investasi Produk</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('chart')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'chart'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Chart & Analisis
            </button>
            <button
              onClick={() => setActiveTab('invest')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'invest'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Wallet className="h-4 w-4" />
              Investasi
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'chart' && (
              <div className="space-y-6">
                {/* Trading Chart */}
                      <FinalV5Chart product={product} />
                
                {/* Product Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Harga Saat Ini</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      Rp {currentPrice.toLocaleString('id-ID')}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Expected Return</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      +{product.expectedReturn}%
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Min. Investasi</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      Rp {minAmount.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Informasi Produk</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Jenis:</span>
                      <span className="ml-2 font-medium">{product.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Kategori:</span>
                      <span className="ml-2 font-medium">{product.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tingkat Risiko:</span>
                      <span className="ml-2 font-medium">{product.riskLevel}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className="ml-2 font-medium text-green-600">Aktif</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-gray-600">Deskripsi:</span>
                    <p className="mt-1 text-sm text-gray-700">{product.description}</p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={() => setActiveTab('invest')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Mulai Investasi
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'invest' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Ringkasan Produk</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                      <span className="text-gray-600">Harga per Unit:</span>
                <span className="font-medium">Rp {currentPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                      <span className="text-gray-600">Expected Return:</span>
                <span className="font-medium text-green-600">+{product.expectedReturn}%</span>
              </div>
              <div className="flex justify-between">
                      <span className="text-gray-600">Min. Investasi:</span>
                <span className="font-medium">Rp {minAmount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tingkat Risiko:</span>
                      <span className="font-medium">{product.riskLevel}</span>
                    </div>
              </div>
            </div>

            {/* Asset Buy Slider */}
            <AssetBuySlider
              currentPrice={currentPrice}
              minInvestment={minAmount}
              maxInvestment={availableBalance}
              availableBalance={availableBalance}
              onAmountChange={setAmount}
            />

            {/* Available Balance */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-700">Saldo Tersedia</span>
              </div>
                  <div className="text-2xl font-bold text-gray-900">
                Rp {availableBalance.toLocaleString('id-ID')}
              </div>
            </div>

            {/* Error Message */}
            {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('chart')}
                    className="flex-1"
                    disabled={loading}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Lihat Chart
                  </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={loading || amount < (minAmount - 0.01)}
              >
                    {loading ? 'Memproses...' : 'Investasi Sekarang'}
              </Button>
            </div>
          </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

