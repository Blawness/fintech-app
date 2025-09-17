import { Card, CardContent } from '@/components/ui/card'
import { 
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

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

interface TransactionHistoryProps {
  transactions: Transaction[]
  loading?: boolean
}

export function TransactionHistory({ transactions, loading = false }: TransactionHistoryProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600'
      case 'PENDING':
        return 'text-yellow-600'
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
      case 'PENDING':
        return 'Menunggu'
      case 'CANCELLED':
        return 'Dibatalkan'
      default:
        return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Belum Ada Transaksi
        </h3>
        <p className="text-gray-600">
          Riwayat transaksi Anda akan muncul di sini.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
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
  )
}
