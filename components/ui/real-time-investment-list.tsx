'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Shield, AlertTriangle } from 'lucide-react'
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

interface RealTimeInvestmentListProps {
  userId: string
  className?: string
}

export function RealTimeInvestmentList({ userId, className = '' }: RealTimeInvestmentListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsUpdating(true)
      
      // Fetch products and portfolio in parallel
      const [productsResponse, portfolioResponse] = await Promise.all([
        fetch('/api/products'),
        fetch(`/api/portfolio/${userId}`)
      ])

      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData)
      }

      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json()
        setPortfolio(portfolioData)
      }

      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching investment data:', error)
    } finally {
      setLoading(false)
      setIsUpdating(false)
    }
  }, [userId])

  useEffect(() => {
    fetchData()
    
    // Update every 5 seconds
    const interval = setInterval(fetchData, 5000)
    
    return () => clearInterval(interval)
  }, [userId, fetchData])

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
        <div className="text-sm text-gray-500">
          {lastUpdate && `Updated: ${lastUpdate.toLocaleTimeString()}`}
          {isUpdating && (
            <span className="ml-2 text-blue-600">
              <span className="animate-spin">⟳</span> Updating...
            </span>
          )}
        </div>
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
          portfolio={portfolio}
          onClose={() => {
            setShowModal(false)
            setSelectedProduct(null)
          }}
          onSuccess={() => {
            setShowModal(false)
            setSelectedProduct(null)
            // Refresh data after successful investment
            fetchData()
          }}
        />
      )}
    </>
  )
}
