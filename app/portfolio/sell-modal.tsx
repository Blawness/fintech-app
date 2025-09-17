'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AssetSellSlider } from '@/components/ui/asset-sell-slider'
import { X } from 'lucide-react'

// Utility function for consistent rounding
const roundToDecimals = (value: number, decimals: number = 4): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

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

interface SellModalProps {
  holding: Holding
  onClose: () => void
  onSuccess: () => void
}

export function SellModal({ holding, onClose, onSuccess }: SellModalProps) {
  const [units, setUnits] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const maxUnits = roundToDecimals(holding.units, 4)
  const currentPrice = roundToDecimals(holding.product.currentPrice, 2)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (units <= 0) {
      setError('Jumlah unit harus lebih dari 0')
      setLoading(false)
      return
    }

    // Use a small tolerance for floating-point comparison
    const tolerance = 0.0001
    const roundedUnits = roundToDecimals(units, 4)
    if (roundedUnits > (maxUnits + tolerance)) {
      setError(`Anda hanya memiliki ${maxUnits.toFixed(4)} unit`)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/investment/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: holding.productId,
          units: roundedUnits
        })
      })

      if (response.ok) {
        onSuccess()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Terjadi kesalahan saat menjual investasi')
      }
    } catch (error) {
      console.error('Error selling investment:', error)
      setError('Terjadi kesalahan saat menjual investasi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Jual Investasi</CardTitle>
              <CardDescription>{holding.product.name}</CardDescription>
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
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Unit Dimiliki:</span>
                <span className="font-medium">{maxUnits.toFixed(4)} unit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Harga per Unit:</span>
                <span className="font-medium">Rp {currentPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Harga Rata-rata:</span>
                <span className="font-medium">Rp {holding.averagePrice.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Asset Sell Slider */}
            <AssetSellSlider
              maxUnits={maxUnits}
              currentPrice={currentPrice}
              averagePrice={holding.averagePrice}
              onUnitsChange={setUnits}
            />

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
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
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={loading || units <= 0}
              >
                {loading ? 'Memproses...' : 'Jual'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


