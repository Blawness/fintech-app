'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react'

interface PortfolioData {
  totalValue: number
  totalGain: number
  totalGainPercent: number
  rdnBalance: number
  tradingBalance: number
  riskProfile: string
  lastUpdated: string
}

interface OptimizedRealTimePortfolioProps {
  userId: string
  className?: string
}

export function OptimizedRealTimePortfolio({ userId, className = '' }: OptimizedRealTimePortfolioProps) {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [showValues, setShowValues] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Refs for optimization
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastDataHashRef = useRef<string>('')
  const retryCountRef = useRef(0)
  const isVisibleRef = useRef(true)

  // Smart polling with exponential backoff
  const getUpdateInterval = useCallback(() => {
    if (retryCountRef.current === 0) return 30000 // 30 seconds normal
    if (retryCountRef.current === 1) return 60000 // 1 minute after error
    if (retryCountRef.current === 2) return 120000 // 2 minutes after 2 errors
    return 300000 // 5 minutes after 3+ errors
  }, [])

  // Generate data hash for change detection
  const generateDataHash = useCallback((data: PortfolioData) => {
    return `${data.totalValue}-${data.totalGain}-${data.totalGainPercent}-${data.rdnBalance}-${data.tradingBalance}`
  }, [])

  // Optimized fetch function with caching
  const fetchPortfolio = useCallback(async (forceUpdate = false) => {
    try {
      setIsUpdating(true)
      setError(null)
      
      const response = await fetch(`/api/portfolio/${userId}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'If-None-Match': forceUpdate ? undefined : lastDataHashRef.current
        }
      })
      
      if (response.status === 304) {
        // Data hasn't changed, no need to update
        console.log('Portfolio data unchanged, skipping update')
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        const newDataHash = generateDataHash(data)
        
        // Only update if data actually changed
        if (forceUpdate || newDataHash !== lastDataHashRef.current) {
          setPortfolio(data)
          setLastUpdate(new Date())
          lastDataHashRef.current = newDataHash
          retryCountRef.current = 0 // Reset retry count on success
          console.log('Portfolio data updated')
        }
      } else {
        throw new Error(`API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      retryCountRef.current++
    } finally {
      setIsUpdating(false)
    }
  }, [userId, generateDataHash])

  // Handle visibility change to pause/resume updates
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden
      if (isVisibleRef.current) {
        // Resume updates when tab becomes visible
        fetchPortfolio(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [fetchPortfolio])

  // Smart polling with adaptive intervals
  useEffect(() => {
    // Initial fetch
    fetchPortfolio(true)

    // Set up adaptive polling
    const scheduleNextUpdate = () => {
      if (updateIntervalRef.current) {
        clearTimeout(updateIntervalRef.current)
      }
      
      const interval = getUpdateInterval()
      updateIntervalRef.current = setTimeout(() => {
        if (isVisibleRef.current) {
          fetchPortfolio()
          scheduleNextUpdate()
        }
      }, interval)
    }

    scheduleNextUpdate()

    return () => {
      if (updateIntervalRef.current) {
        clearTimeout(updateIntervalRef.current)
      }
    }
  }, [fetchPortfolio, getUpdateInterval])

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    fetchPortfolio(true)
  }, [fetchPortfolio])

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
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-500">
                {lastUpdate && `Updated: ${lastUpdate.toLocaleTimeString()}`}
                {isUpdating && (
                  <span className="ml-1 text-green-600">
                    <span className="animate-spin">⟳</span>
                  </span>
                )}
              </div>
              <button
                onClick={handleRefresh}
                className="text-xs text-blue-600 hover:text-blue-800"
                disabled={isUpdating}
              >
                Refresh
              </button>
            </div>
            {error && (
              <div className="text-xs text-red-600 mt-1">
                Error: {error}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
