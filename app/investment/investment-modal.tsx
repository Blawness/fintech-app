'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, DollarSign, TrendingUp } from 'lucide-react'

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
  holdings: any[]
}

interface InvestmentModalProps {
  product: Product
  userId: string
  portfolio: Portfolio | null
  onClose: () => void
  onSuccess: () => void
}

export function InvestmentModal({ product, userId, portfolio, onClose, onSuccess }: InvestmentModalProps) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const minAmount = product.minInvestment
  const currentPrice = product.currentPrice
  const units = amount ? (parseFloat(amount) / currentPrice) : 0
  const availableBalance = portfolio?.rdnBalance || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const investmentAmount = parseFloat(amount)
    
    if (investmentAmount < minAmount) {
      setError(`Minimum investasi adalah Rp ${minAmount.toLocaleString('id-ID')}`)
      setLoading(false)
      return
    }

    if (investmentAmount > availableBalance) {
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
          amount: investmentAmount
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
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Investasi</CardTitle>
              <CardDescription>{product.name}</CardDescription>
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
                <span className="text-sm text-gray-600">Harga per Unit:</span>
                <span className="font-medium">Rp {currentPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Expected Return:</span>
                <span className="font-medium text-green-600">+{product.expectedReturn}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Min. Investasi:</span>
                <span className="font-medium">Rp {minAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Investment Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah Investasi (Rp)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Minimum Rp ${minAmount.toLocaleString('id-ID')}`}
                min={minAmount}
                step="1000"
                required
              />
            </div>

            {/* Calculation */}
            {amount && parseFloat(amount) >= minAmount && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Perhitungan</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Jumlah Unit:</span>
                  <span className="font-medium text-blue-900">{units.toFixed(4)} unit</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Total Investasi:</span>
                  <span className="font-medium text-blue-900">Rp {parseFloat(amount).toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}

            {/* Available Balance */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Saldo Tersedia</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                Rp {availableBalance.toLocaleString('id-ID')}
              </div>
            </div>

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
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={loading || !amount || parseFloat(amount) < minAmount}
              >
                {loading ? 'Memproses...' : 'Investasi'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
