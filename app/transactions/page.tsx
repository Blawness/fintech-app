'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Coins
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

export default function TransactionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('order')
  const [activeFilter, setActiveFilter] = useState('semua')

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`/api/transactions/${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchTransactions()
  }, [session, status, router, fetchTransactions])

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
          <h1 className="text-xl font-semibold">Transaksi</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-32">
        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('order')}
            className={`pb-2 border-b-2 ${
              activeTab === 'order' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500'
            }`}
          >
            Order
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 border-b-2 ${
              activeTab === 'history' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500'
            }`}
          >
            History
          </button>
        </div>

        {activeTab === 'order' && (
          <>
            {/* Filter Tabs */}
            <div className="flex space-x-2 mb-6">
              {['Semua', 'Reksa Dana', 'Saham', 'Obligasi Negara'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter.toLowerCase().replace(' ', ''))}
                  className={`px-4 py-2 rounded-full text-sm ${
                    activeFilter === filter.toLowerCase().replace(' ', '')
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Empty State */}
            {transactions.length === 0 && (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                      <Coins className="w-12 h-12 text-green-500" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-gray-200">
                      <PiggyBank className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Belum Ada Transaksi
                </h3>
                <p className="text-gray-600 mb-6">
                  Yuk, kembangkan terus investasimu.
                </p>
                <Button className="bg-green-600 hover:bg-green-700">
                  Investasi Sekarang
                </Button>
              </div>
            )}

            {/* Transaction List */}
            {transactions.length > 0 && (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <Card key={transaction.id}>
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
                              {new Date(transaction.createdAt).toLocaleDateString('id-ID')}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            Rp {transaction.amount.toLocaleString('id-ID')}
                          </div>
                          <div className={`text-sm ${
                            transaction.status === 'COMPLETED' 
                              ? 'text-green-600' 
                              : transaction.status === 'PENDING'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}>
                            {transaction.status === 'COMPLETED' && 'Selesai'}
                            {transaction.status === 'PENDING' && 'Menunggu'}
                            {transaction.status === 'CANCELLED' && 'Dibatalkan'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Riwayat Transaksi
            </h3>
            <p className="text-gray-600">
              Riwayat transaksi Anda akan muncul di sini.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
