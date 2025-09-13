'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Transaction {
  id: string
  userId: string
  productId: string
  type: string
  amount: number
  units: number
  price: number
  totalValue: number
  status: string
  createdAt: string
  updatedAt: string
  product: {
    id: string
    name: string
    type: string
    category: string
    riskLevel: string
    currentPrice: number
  }
}

interface RealTimePortfolioTransactionsProps {
  userId: string
  className?: string
}

export function RealTimePortfolioTransactions({ userId, className = '' }: RealTimePortfolioTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchTransactions = async () => {
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/transactions/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data || [])
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
    
    // Update every 10 seconds (less frequent than portfolio)
    const interval = setInterval(fetchTransactions, 10000)
    
    return () => clearInterval(interval)
  }, [userId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'BUY' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  const getTypeColor = (type: string) => {
    return type === 'BUY' ? 'text-green-600' : 'text-red-600'
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
          <CardDescription>Daftar transaksi investasi Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat riwayat transaksi...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Riwayat Transaksi</CardTitle>
            <CardDescription>Daftar transaksi investasi Anda</CardDescription>
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
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada transaksi</h3>
            <p className="text-gray-600 mb-4">Mulai investasi untuk melihat riwayat transaksi</p>
            <button 
              onClick={() => window.location.href = '/investment'}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Mulai Investasi
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{transaction.product.name}</h3>
                      <Badge className={getStatusColor(transaction.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(transaction.status)}
                          {transaction.status}
                        </div>
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(transaction.createdAt).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold flex items-center gap-1 ${getTypeColor(transaction.type)}`}>
                      {getTypeIcon(transaction.type)}
                      {transaction.type === 'BUY' ? 'Beli' : 'Jual'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.units?.toFixed(4) || '0'} unit
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Jumlah</div>
                    <div className="font-medium">Rp {transaction.amount?.toLocaleString('id-ID') || '0'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Harga per Unit</div>
                    <div className="font-medium">Rp {transaction.price?.toLocaleString('id-ID') || '0'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Nilai</div>
                    <div className="font-medium">Rp {transaction.totalValue?.toLocaleString('id-ID') || '0'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Jenis Produk</div>
                    <div className="font-medium">{transaction.product.type}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
