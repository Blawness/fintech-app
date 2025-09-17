'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react'

interface PortfolioData {
  totalValue: number
  totalGain: number
  totalGainPercent: number
  rdnBalance: number
  tradingBalance: number
  riskProfile: string
}

interface RealTimePortfolioProps {
  userId: string
  className?: string
}

export function RealTimePortfolio({ userId, className = '' }: RealTimePortfolioProps) {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [showValues, setShowValues] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchPortfolio = useCallback(async () => {
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/portfolio/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setPortfolio(data)
        setLastUpdate(new Date())
      } else {
        console.error('Portfolio API error:', response.status, response.statusText)
        // Try to get portfolio from investment API as fallback
        const fallbackResponse = await fetch('/api/investment/portfolio')
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          setPortfolio(fallbackData)
          setLastUpdate(new Date())
        }
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    } finally {
      setIsUpdating(false)
    }
  }, [userId])

  useEffect(() => {
    fetchPortfolio()
    
    // Update every 5 seconds
    const interval = setInterval(fetchPortfolio, 5000)
    
    return () => clearInterval(interval)
  }, [userId, fetchPortfolio])

  if (!portfolio) {
    return (
      <Card className={`bg-gradient-to-r from-green-50 to-green-100 border-green-200 ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-gradient-to-r from-green-50 to-green-100 border-green-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Nilai Portofolio</h2>
            <div className="flex items-center space-x-2">
              {showValues ? (
                <span className="text-2xl font-bold text-gray-900">
                  Rp {portfolio.totalValue?.toLocaleString('id-ID') || '0'}
                </span>
              ) : (
                <span className="text-2xl font-bold text-gray-900">••••••••</span>
              )}
              <button 
                onClick={() => setShowValues(!showValues)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showValues ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-gray-600">Keuntungan</span>
              {showValues ? (
                <span className={`text-sm font-medium flex items-center ${
                  portfolio.totalGain >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {portfolio.totalGain >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {portfolio.totalGain >= 0 ? '+' : ''}Rp {portfolio.totalGain?.toLocaleString('id-ID') || '0'} 
                  ({portfolio.totalGainPercent >= 0 ? '+' : ''}{portfolio.totalGainPercent?.toFixed(2) || '0.00'}%)
                </span>
              ) : (
                <span className="text-sm font-medium text-green-600">••••••</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-gray-600">Imbal Hasil</span>
              <span className="text-sm font-medium text-gray-900">
                {portfolio.totalGainPercent >= 0 ? '+' : ''}{portfolio.totalGainPercent?.toFixed(2) || '0.00'}%
              </span>
            </div>
            <div className="text-sm text-gray-600">Saldo RDN</div>
            <div className="text-sm font-medium text-gray-900">
              {showValues ? `Rp ${portfolio.rdnBalance?.toLocaleString('id-ID') || '0'}` : '••••••'}
            </div>
            <div className="text-sm text-gray-600">Saldo Trading</div>
            <div className="text-sm font-medium text-gray-900">
              {showValues ? `Rp ${portfolio.tradingBalance?.toLocaleString('id-ID') || '0'}` : '••••••'}
            </div>
            {lastUpdate && (
              <div className="text-xs text-gray-500 mt-2">
                {isUpdating ? (
                  <span className="text-green-600">
                    <span className="animate-spin">⟳</span> Updating...
                  </span>
                ) : (
                  `Updated: ${lastUpdate.toLocaleTimeString()}`
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
