'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react'
import { BottomNavigation } from '@/components/ui/bottom-navigation'

interface Transaction {
  id: string
  type: 'BUY' | 'SELL'
  productName: string
  amount: number
  units: number
  price: number
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
}

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchHistory()
  }, [session, status])

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/transactions/${session?.user?.id}?type=history`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <CheckCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600'
      case 'CANCELLED':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Selesai'
      case 'CANCELLED':
        return 'Dibatalkan'
      default:
        return 'Unknown'
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true
    if (filter === 'completed') return transaction.status === 'COMPLETED'
    if (filter === 'cancelled') return transaction.status === 'CANCELLED'
    return true
  })

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
            <h1 className="text-xl font-semibold">Riwayat Transaksi</h1>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6">
          {[
            { key: 'all', label: 'Semua' },
            { key: 'completed', label: 'Selesai' },
            { key: 'cancelled', label: 'Dibatalkan' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-4 py-2 rounded-full text-sm ${
                filter === filterOption.key
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Belum Ada Riwayat Transaksi
            </h3>
            <p className="text-gray-600 mb-6">
              Riwayat transaksi yang sudah selesai akan muncul di sini.
            </p>
            <Button 
              onClick={() => router.push('/explore')}
              className="bg-green-600 hover:bg-green-700"
            >
              Mulai Investasi
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'BUY' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'BUY' ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{transaction.productName}</div>
                        <div className="text-sm text-gray-600">
                          {transaction.type === 'BUY' ? 'Beli' : 'Jual'} • {transaction.units} unit
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        Rp {transaction.amount.toLocaleString('id-ID')}
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(transaction.status)}
                        <span className={`text-sm ${getStatusColor(transaction.status)}`}>
                          {getStatusText(transaction.status)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        @ Rp {transaction.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
