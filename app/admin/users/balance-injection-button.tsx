'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, DollarSign, Plus } from 'lucide-react'

interface BalanceInjectionButtonProps {
  userId: string
  userName: string
  currentBalance: number
}

export function BalanceInjectionButton({ userId, userName, currentBalance }: BalanceInjectionButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
    setError('') // Clear error when user types
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const injectionAmount = parseFloat(amount)
    
    if (injectionAmount <= 0) {
      setError('Jumlah harus lebih dari 0')
      setLoading(false)
      return
    }

    if (injectionAmount > 100000000) { // Max 100 juta
      setError('Maksimal injeksi saldo adalah Rp 100.000.000')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/users/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          amount: injectionAmount
        })
      })

      if (response.ok) {
        setShowModal(false)
        setAmount('')
        window.location.reload()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Terjadi kesalahan saat menambah saldo')
      }
    } catch (error) {
      console.error('Error injecting balance:', error)
      setError('Terjadi kesalahan saat menambah saldo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => {
          setShowModal(true)
          setAmount('')
          setError('')
        }}
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Plus className="h-4 w-4 mr-1" />
        Saldo
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Tambah Saldo</CardTitle>
                  <CardDescription>{userName}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Current Balance */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Saldo Saat Ini</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    Rp {currentBalance.toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Injection Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Jumlah yang Ditambahkan (Rp)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="Masukkan jumlah saldo"
                    min="1"
                    max="100000000"
                    step="1000"
                    required
                    autoComplete="off"
                  />
                </div>

                {/* Preview */}
                {amount && parseFloat(amount) > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Plus className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Saldo Setelah Injeksi</span>
                    </div>
                    <div className="text-lg font-bold text-green-900">
                      Rp {(currentBalance + parseFloat(amount)).toLocaleString('id-ID')}
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
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                    disabled={loading}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={loading || !amount || parseFloat(amount) <= 0}
                  >
                    {loading ? 'Memproses...' : 'Tambah Saldo'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
