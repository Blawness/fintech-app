'use client'

import { useState, useEffect } from 'react'
import MinimalisticLineChart from '@/components/ui/minimalistic-line-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, BarChart3 } from 'lucide-react'

interface Product {
  id: string
  name: string
  currentPrice: number
  riskLevel: string
  expectedReturn: number
  category: string
}

export default function ChartDemoPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Sample products for demo
  const sampleProducts: Product[] = [
    {
      id: '1',
      name: 'Amazon.com Inc',
      currentPrice: 146.79,
      riskLevel: 'AGRESIF',
      expectedReturn: 15.5,
      category: 'Technology'
    },
    {
      id: '2',
      name: 'Apple Inc',
      currentPrice: 189.25,
      riskLevel: 'MODERAT',
      expectedReturn: 12.3,
      category: 'Technology'
    },
    {
      id: '3',
      name: 'Tesla Inc',
      currentPrice: 248.50,
      riskLevel: 'AGRESIF',
      expectedReturn: 18.7,
      category: 'Automotive'
    },
    {
      id: '4',
      name: 'Microsoft Corp',
      currentPrice: 378.85,
      riskLevel: 'KONSERVATIF',
      expectedReturn: 8.9,
      category: 'Technology'
    },
    {
      id: '5',
      name: 'Google LLC',
      currentPrice: 142.30,
      riskLevel: 'MODERAT',
      expectedReturn: 11.2,
      category: 'Technology'
    }
  ]

  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProducts(sampleProducts)
      if (sampleProducts.length > 0) {
        setSelectedProduct(sampleProducts[0])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'KONSERVATIF': return 'text-green-600 bg-green-100'
      case 'MODERAT': return 'text-yellow-600 bg-yellow-100'
      case 'AGRESIF': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Minimalistic Line Chart Demo
          </h1>
          <p className="text-gray-600">
            Demonstrasi UI line chart yang minimalistic untuk produk investasi
          </p>
        </div>

        {/* Product Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Pilih Produk Investasi
            </CardTitle>
            <CardDescription>
              Pilih produk untuk melihat chart minimalistic
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading products...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedProduct?.id === product.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <Badge className={getRiskColor(product.riskLevel)}>
                        {product.riskLevel}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      Rp {product.currentPrice.toLocaleString('id-ID')}
                    </div>
                    <div className="text-sm text-gray-600">
                      Expected: +{product.expectedReturn}% • {product.category}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chart Display */}
        {selectedProduct && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Minimalistic Line Chart</span>
                <Button
                  onClick={fetchProducts}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </CardTitle>
              <CardDescription>
                Chart line minimalistic untuk {selectedProduct.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MinimalisticLineChart 
                product={selectedProduct}
                className="w-full"
              />
            </CardContent>
          </Card>
        )}

        {/* Features Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Fitur Chart Minimalistic</CardTitle>
            <CardDescription>
              Karakteristik dan fitur dari line chart yang minimalistic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Desain Minimalistic</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Clean line chart tanpa elemen candlestick</li>
                  <li>• Warna hijau untuk line chart yang elegan</li>
                  <li>• Layout yang bersih dan tidak berlebihan</li>
                  <li>• Fokus pada data harga yang penting</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Fitur Interaktif</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Timeframe selector (1D, 5D, 1M, 6M, YTD, 1Y, 5Y, MAX)</li>
                  <li>• Price change indicator dengan warna</li>
                  <li>• Responsive design untuk berbagai ukuran layar</li>
                  <li>• Loading state yang smooth</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
