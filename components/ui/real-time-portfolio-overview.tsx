'use client'

import { useState, useEffect } from 'react'
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

interface RealTimePortfolioOverviewProps {
  userId: string
  className?: string
}

export function RealTimePortfolioOverview({ userId, className = '' }: RealTimePortfolioOverviewProps) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchPortfolio = async () => {
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/portfolio/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setPortfolio(data)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    } finally {
      setLoading(false)
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    fetchPortfolio()
    
    // Update every 5 seconds
    const interval = setInterval(fetchPortfolio, 5000)
    
    return () => clearInterval(interval)
  }, [userId])

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-300 rounded w-3/4 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Portfolio tidak ditemukan</h3>
        <p className="text-gray-600">Mulai investasi untuk melihat portfolio Anda</p>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Nilai Portfolio',
      value: `Rp ${portfolio.totalValue?.toLocaleString('id-ID') || '0'}`,
      icon: PieChart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Total Keuntungan',
      value: `Rp ${portfolio.totalGain?.toLocaleString('id-ID') || '0'}`,
      icon: portfolio.totalGain >= 0 ? TrendingUp : TrendingDown,
      color: portfolio.totalGain >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: portfolio.totalGain >= 0 ? 'bg-green-100' : 'bg-red-100'
    },
    {
      name: 'Return (%)',
      value: `${portfolio.totalGainPercent >= 0 ? '+' : ''}${portfolio.totalGainPercent?.toFixed(2) || '0.00'}%`,
      icon: portfolio.totalGainPercent >= 0 ? TrendingUp : TrendingDown,
      color: portfolio.totalGainPercent >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: portfolio.totalGainPercent >= 0 ? 'bg-green-100' : 'bg-red-100'
    },
    {
      name: 'Saldo Tersedia',
      value: `Rp ${portfolio.rdnBalance?.toLocaleString('id-ID') || '0'}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  return (
    <div className={className}>
      {/* Update Status */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Portfolio Overview</h2>
        <div className="text-sm text-gray-500">
          {lastUpdate && `Updated: ${lastUpdate.toLocaleTimeString()}`}
          {isUpdating && (
            <span className="ml-2 text-blue-600">
              <span className="animate-spin">⟳</span> Updating...
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </div>
  )
}
