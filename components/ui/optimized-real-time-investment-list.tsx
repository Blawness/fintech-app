'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Shield, AlertTriangle } from 'lucide-react'
import { InvestmentModal } from '@/app/investment/investment-modal'

interface Product {
  id: string
  name: string
  type: string
  category: string
  riskLevel: string
  expectedReturn: number
  minInvestment: number
  currentPrice: number
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Holding {
  id: string
  productId: string
  units: number
  averagePrice: number
  currentValue: number
  gain: number
  gainPercent: number
  product: Product
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

interface OptimizedRealTimeInvestmentListProps {
  userId: string
  className?: string
}

export function OptimizedRealTimeInvestmentList({ userId, className = '' }: OptimizedRealTimeInvestmentListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Refs for optimization
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastProductsHashRef = useRef<string>('')
  const lastPortfolioHashRef = useRef<string>('')
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
  const generateProductsHash = useCallback((products: Product[]) => {
    return products.map(p => `${p.id}-${p.currentPrice}`).join('|')
  }, [])

  const generatePortfolioHash = useCallback((portfolio: Portfolio) => {
    return `${portfolio.totalValue}-${portfolio.totalGain}-${portfolio.holdings.length}`
  }, [])

  // Optimized fetch function
  const fetchData = useCallback(async (forceUpdate = false) => {
    try {
      setIsUpdating(true)
      setError(null)
      
      // Fetch products and portfolio in parallel
      const [productsResponse, portfolioResponse] = await Promise.all([
        fetch('/api/products', {
          headers: {
            'Cache-Control': 'no-cache',
            ...(forceUpdate ? {} : { 'If-None-Match': lastProductsHashRef.current })
          }
        }),
        fetch(`/api/portfolio/${userId}`, {
          headers: {
            'Cache-Control': 'no-cache',
            ...(forceUpdate ? {} : { 'If-None-Match': lastPortfolioHashRef.current })
          }
        })
      ])

      // Handle products
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        const newProductsHash = generateProductsHash(productsData)
        
        if (forceUpdate || newProductsHash !== lastProductsHashRef.current) {
          setProducts(productsData)
          lastProductsHashRef.current = newProductsHash
          console.log('Products data updated')
        }
      } else if (productsResponse.status !== 304) {
        throw new Error(`Products API error: ${productsResponse.status}`)
      }

      // Handle portfolio
      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json()
        const newPortfolioHash = generatePortfolioHash(portfolioData)
        
        if (forceUpdate || newPortfolioHash !== lastPortfolioHashRef.current) {
          setPortfolio(portfolioData)
          lastPortfolioHashRef.current = newPortfolioHash
          console.log('Portfolio data updated')
        }
      } else if (portfolioResponse.status !== 304) {
        throw new Error(`Portfolio API error: ${portfolioResponse.status}`)
      }

      setLastUpdate(new Date())
      retryCountRef.current = 0 // Reset retry count on success
    } catch (error) {
      console.error('Error fetching data:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      retryCountRef.current++
    } finally {
      setLoading(false)
      setIsUpdating(false)
    }
  }, [userId, generateProductsHash, generatePortfolioHash])

  // Handle visibility change to pause/resume updates
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden
      if (isVisibleRef.current) {
        // Resume updates when tab becomes visible
        fetchData(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [fetchData])

  // Smart polling with adaptive intervals
  useEffect(() => {
    // Initial fetch
    fetchData(true)

    // Set up adaptive polling
    const scheduleNextUpdate = () => {
      if (updateIntervalRef.current) {
        clearTimeout(updateIntervalRef.current)
      }
      
      const interval = getUpdateInterval()
      updateIntervalRef.current = setTimeout(() => {
        if (isVisibleRef.current) {
          fetchData()
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
  }, [fetchData, getUpdateInterval])

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'KONSERVATIF':
        return <Shield className="h-4 w-4 text-green-600" />
      case 'MODERAT':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'AGRESIF':
        return <TrendingUp className="h-4 w-4 text-red-600" />
      default:
        return <Shield className="h-4 w-4 text-gray-600" />
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'KONSERVATIF':
        return 'bg-green-100 text-green-800'
      case 'MODERAT':
        return 'bg-yellow-100 text-yellow-800'
      case 'AGRESIF':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PASAR_UANG':
        return 'bg-blue-100 text-blue-800'
      case 'OBLIGASI':
        return 'bg-purple-100 text-purple-800'
      case 'CAMPURAN':
        return 'bg-orange-100 text-orange-800'
      case 'SAHAM':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleInvest = (product: Product) => {
    setSelectedProduct(product)
    setShowModal(true)
  }

  const getUserHolding = (productId: string) => {
    if (!portfolio) return null
    return portfolio.holdings.find(h => h.productId === productId)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat produk investasi...</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada produk investasi</h3>
        <p className="text-gray-600">Admin belum menambahkan produk investasi</p>
      </div>
    )
  }

  return (
    <>
      {/* Update Status */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Produk Investasi Tersedia</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {lastUpdate && `Updated: ${lastUpdate.toLocaleTimeString()}`}
            {isUpdating && (
              <span className="ml-2 text-blue-600">
                <span className="animate-spin">⟳</span> Updating...
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={isUpdating}
          >
            Refresh
          </button>
        </div>
        {error && (
          <div className="text-sm text-red-600">
            Error: {error}
          </div>
        )}
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {products.map((product) => {
          const userHolding = getUserHolding(product.id)
          
          return (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className={getCategoryColor(product.category)}>
                        {product.category.replace('_', ' ')}
                      </Badge>
                      <Badge className={getRiskColor(product.riskLevel)}>
                        <div className="flex items-center gap-1">
                          {getRiskIcon(product.riskLevel)}
                          {product.riskLevel}
                        </div>
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      +{product.expectedReturn}%
                    </div>
                    <div className="text-sm text-gray-500">Expected Return</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Harga per Unit:</span>
                    <span className="font-medium">Rp {product.currentPrice?.toLocaleString('id-ID') || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Min. Investasi:</span>
                    <span className="font-medium">Rp {product.minInvestment?.toLocaleString('id-ID') || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Jenis:</span>
                    <span className="font-medium">{product.type}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {product.description}
                </p>

                {userHolding && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">Kepemilikan Anda</span>
                      <span className="text-sm text-blue-700">{userHolding.units?.toFixed(4) || '0'} unit</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Nilai Saat Ini:</span>
                      <span className="font-medium text-blue-900">
                        Rp {userHolding.currentValue?.toLocaleString('id-ID') || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Keuntungan:</span>
                      <span className={`font-medium ${userHolding.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {userHolding.gain >= 0 ? '+' : ''}Rp {userHolding.gain?.toLocaleString('id-ID') || '0'}
                        ({userHolding.gainPercent >= 0 ? '+' : ''}{userHolding.gainPercent?.toFixed(2) || '0.00'}%)
                      </span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => handleInvest(product)}
                  className="w-full"
                  variant={userHolding ? "outline" : "default"}
                >
                  {userHolding ? 'Tambah Investasi' : 'Mulai Investasi'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {showModal && selectedProduct && (
        <InvestmentModal
          product={selectedProduct}
          userId={userId}
          portfolio={portfolio}
          onClose={() => {
            setShowModal(false)
            setSelectedProduct(null)
          }}
          onSuccess={() => {
            setShowModal(false)
            setSelectedProduct(null)
            // Refresh data after successful investment
            fetchData(true)
          }}
        />
      )}
    </>
  )
}
