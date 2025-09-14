'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react'

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

interface Portfolio {
  id: string
  userId: string
  totalValue: number
  totalGain: number
  totalGainPercent: number
  riskProfile: string
  rdnBalance: number
  tradingBalance: number
  holdings: Holding[]
}

interface PortfolioOverviewProps {
  portfolio: Portfolio
}

export function PortfolioOverview({ portfolio }: PortfolioOverviewProps) {
  const stats = [
    {
      name: 'Total Nilai Portfolio',
      value: `Rp ${portfolio.totalValue.toLocaleString('id-ID')}`,
      icon: PieChart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Total Keuntungan',
      value: `Rp ${portfolio.totalGain.toLocaleString('id-ID')}`,
      icon: portfolio.totalGain >= 0 ? TrendingUp : TrendingDown,
      color: portfolio.totalGain >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: portfolio.totalGain >= 0 ? 'bg-green-100' : 'bg-red-100'
    },
    {
      name: 'Return (%)',
      value: `${portfolio.totalGainPercent >= 0 ? '+' : ''}${portfolio.totalGainPercent.toFixed(2)}%`,
      icon: portfolio.totalGainPercent >= 0 ? TrendingUp : TrendingDown,
      color: portfolio.totalGainPercent >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: portfolio.totalGainPercent >= 0 ? 'bg-green-100' : 'bg-red-100'
    },
    {
      name: 'Saldo Tersedia',
      value: `Rp ${portfolio.rdnBalance.toLocaleString('id-ID')}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.name}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

