'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, History } from 'lucide-react'

interface Transaction {
  id: string
  type: string
  amount: number
  units: number
  price: number
  totalValue: number
  status: string
  createdAt: string
  product: {
    id: string
    name: string
    type: string
  }
}

interface PortfolioTransactionsProps {
  transactions: Transaction[]
}

export function PortfolioTransactions({ transactions }: PortfolioTransactionsProps) {
  const getTypeIcon = (type: string) => {
    return type === 'BUY' ? TrendingUp : TrendingDown
  }

  const getTypeColor = (type: string) => {
    return type === 'BUY' ? 'text-green-600' : 'text-red-600'
  }

  const getTypeBgColor = (type: string) => {
    return type === 'BUY' ? 'bg-green-100' : 'bg-red-100'
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

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Riwayat Transaksi
          </CardTitle>
          <CardDescription>
            Semua transaksi investasi Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada transaksi</h3>
            <p className="text-gray-600">Transaksi investasi Anda akan muncul di sini</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Riwayat Transaksi
        </CardTitle>
        <CardDescription>
          {transactions.length} transaksi terbaru
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const TypeIcon = getTypeIcon(transaction.type)
            
            return (
              <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getTypeBgColor(transaction.type)}`}>
                      <TypeIcon className={`h-4 w-4 ${getTypeColor(transaction.type)}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{transaction.product.name}</h3>
                      <p className="text-sm text-gray-600">{transaction.product.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getTypeColor(transaction.type)}`}>
                      {transaction.type === 'BUY' ? '-' : '+'}Rp {transaction.totalValue.toLocaleString('id-ID')}
                    </div>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Jenis</div>
                    <div className="font-medium">
                      {transaction.type === 'BUY' ? 'Beli' : 'Jual'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Unit</div>
                    <div className="font-medium">{transaction.units.toFixed(4)} unit</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Harga</div>
                    <div className="font-medium">Rp {transaction.price.toLocaleString('id-ID')}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Tanggal</div>
                    <div className="font-medium">
                      {new Date(transaction.createdAt).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {transactions.length >= 10 && (
          <div className="text-center mt-6">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Lihat Semua Transaksi
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}







