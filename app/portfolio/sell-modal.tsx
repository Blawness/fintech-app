'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, TrendingDown, DollarSign } from 'lucide-react'

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
  const [units, setUnits] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const maxUnits = holding.units
  const currentPrice = holding.product.currentPrice
  const totalValue = units ? (parseFloat(units) * currentPrice) : 0
  const gain = units ? ((currentPrice - holding.averagePrice) * parseFloat(units)) : 0
  const gainPercent = units ? (((currentPrice - holding.averagePrice) / holding.averagePrice) * 100) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const sellUnits = parseFloat(units)
    
    if (sellUnits <= 0) {
      setError('Jumlah unit harus lebih dari 0')
      setLoading(false)
      return
    }

    if (sellUnits > maxUnits) {
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
          units: sellUnits
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

            {/* Units to Sell */}
            <div className="space-y-2">
              <Label htmlFor="units">Jumlah Unit yang Dijual</Label>
              <Input
                id="units"
                type="number"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                placeholder={`Maksimal ${maxUnits.toFixed(4)} unit`}
                min="0.0001"
                max={maxUnits}
                step="0.0001"
                required
              />
            </div>

            {/* Calculation */}
            {units && parseFloat(units) > 0 && (
              <div className="bg-red-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">Perhitungan Penjualan</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-700">Unit Dijual:</span>
                  <span className="font-medium text-red-900">{parseFloat(units).toFixed(4)} unit</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-700">Total Penjualan:</span>
                  <span className="font-medium text-red-900">Rp {totalValue.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-700">Keuntungan:</span>
                  <span className={`font-medium ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {gain >= 0 ? '+' : ''}Rp {gain.toLocaleString('id-ID')}
                    ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            )}

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
                disabled={loading || !units || parseFloat(units) <= 0}
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

