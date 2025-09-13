'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, RefreshCw, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

interface MarketStatus {
  isRunning: boolean
  timestamp: string
}

interface ProductUpdate {
  id: string
  name: string
  oldPrice: number
  newPrice: number
  change: number
  changePercent: number
}

interface PriceHistory {
  id: string
  price: number
  change: number
  changePercent: number
  timestamp: string
}

interface ProductHistory {
  product: {
    id: string
    name: string
    riskLevel: string
    expectedReturn: number
  }
  history: PriceHistory[]
}

export default function MarketControlPage() {
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<ProductUpdate[]>([])
  const [priceHistory, setPriceHistory] = useState<Record<string, ProductHistory>>({})
  const [interval, setInterval] = useState(10000)
  const [showHistory, setShowHistory] = useState(false)

  const fetchMarketStatus = async () => {
    try {
      const response = await fetch('/api/market/control')
      const data = await response.json()
      setMarketStatus(data)
    } catch (error) {
      console.error('Error fetching market status:', error)
    }
  }

  const fetchPriceHistory = async () => {
    try {
      const response = await fetch('/api/market/history?hours=24&limit=100')
      const data = await response.json()
      if (data.data) {
        setPriceHistory(data.data)
      }
    } catch (error) {
      console.error('Error fetching price history:', error)
    }
  }

  const controlMarket = async (action: string) => {
    setIsLoading(true)
    try {
      let response
      
      if (action === 'start') {
        response = await fetch('/api/market/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ interval }),
        })
      } else {
        response = await fetch('/api/market/control', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action }),
        })
      }
      
      const data = await response.json()
      
      if (response.ok) {
        setMarketStatus(data)
        if (action === 'start') {
          // Start polling for updates
          startPolling()
        } else if (action === 'stop') {
          // Stop polling
          stopPolling()
        }
      } else {
        alert(data.error || 'Error controlling market simulator')
      }
    } catch (error) {
      console.error('Error controlling market:', error)
      alert('Error controlling market simulator')
    } finally {
      setIsLoading(false)
    }
  }

  const simulateMarket = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/market/simulate', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setLastUpdate(data.products || [])
        alert(`Market simulation completed! Updated ${data.updated} products`)
      } else {
        alert(data.error || 'Error simulating market')
      }
    } catch (error) {
      console.error('Error simulating market:', error)
      alert('Error simulating market')
    } finally {
      setIsLoading(false)
    }
  }

  const startPolling = () => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/market/simulate')
        const data = await response.json()
        if (data.products) {
          setLastUpdate(data.products)
        }
      } catch (error) {
        console.error('Error polling market updates:', error)
      }
    }, 5000) // Poll every 5 seconds

    // Store interval ID for cleanup
    ;(window as any).marketPollInterval = pollInterval
  }

  const stopPolling = () => {
    if ((window as any).marketPollInterval) {
      clearInterval((window as any).marketPollInterval)
      ;(window as any).marketPollInterval = null
    }
  }

  useEffect(() => {
    fetchMarketStatus()
    fetchPriceHistory()
    
    // Cleanup on unmount
    return () => {
      stopPolling()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Market Simulator Control
          </h1>
          <p className="text-gray-600">
            Kelola simulasi pasar untuk produk investasi
          </p>
        </div>

        {/* Market Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Market Status
              </CardTitle>
              <CardDescription>
                Status simulasi pasar saat ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={marketStatus?.isRunning ? "default" : "secondary"}>
                    {marketStatus?.isRunning ? "Running" : "Stopped"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Update:</span>
                  <span className="text-sm text-gray-600">
                    {marketStatus?.timestamp ? new Date(marketStatus.timestamp).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market Controls</CardTitle>
              <CardDescription>
                Kontrol simulasi pasar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Interval (ms):</label>
                  <input
                    type="number"
                    value={interval}
                    onChange={(e) => setInterval(Number(e.target.value))}
                    className="w-20 px-2 py-1 border rounded text-sm"
                    min="1000"
                    max="60000"
                    step="1000"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => controlMarket('start')}
                    disabled={isLoading || marketStatus?.isRunning}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start
                  </Button>
                  <Button
                    onClick={() => controlMarket('stop')}
                    disabled={isLoading || !marketStatus?.isRunning}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    Stop
                  </Button>
                  <Button
                    onClick={simulateMarket}
                    disabled={isLoading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Simulate Once
                  </Button>
                  <Button
                    onClick={() => {
                      setShowHistory(!showHistory)
                      if (!showHistory) {
                        fetchPriceHistory()
                      }
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    {showHistory ? 'Hide' : 'Show'} History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Last Update Results */}
        {lastUpdate && lastUpdate.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Last Market Update</CardTitle>
              <CardDescription>
                Hasil update terakhir dari simulasi pasar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lastUpdate && lastUpdate.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{product.name}</h3>
                      <div className="text-sm text-gray-600">
                        Rp {product.oldPrice?.toLocaleString('id-ID') || '0'} → Rp {product.newPrice?.toLocaleString('id-ID') || '0'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 ${
                        product.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.change >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="font-medium">
                          {product.change >= 0 ? '+' : ''}{product.changePercent?.toFixed(2) || '0.00'}%
                        </span>
                      </div>
                      <div className={`text-sm ${
                        product.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.change >= 0 ? '+' : ''}Rp {product.change?.toLocaleString('id-ID') || '0'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Price History */}
        {showHistory && priceHistory && Object.keys(priceHistory).length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Price History (Last 24 Hours)</CardTitle>
              <CardDescription>
                Riwayat perubahan harga produk investasi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {priceHistory && Object.entries(priceHistory).map(([productId, productData]) => (
                  <div key={productId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">{productData.product.name}</h3>
                        <div className="text-sm text-gray-600">
                          Risk: {productData.product.riskLevel} | 
                          Expected Return: {productData.product.expectedReturn}%
                        </div>
                      </div>
                      <Badge variant="outline">
                        {productData.history?.length || 0} updates
                      </Badge>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {productData.history && productData.history.slice(0, 10).map((record) => (
                        <div key={record.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">
                              {new Date(record.timestamp).toLocaleTimeString()}
                            </span>
                            <span className="font-mono">
                              Rp {record.price?.toLocaleString('id-ID') || '0'}
                            </span>
                          </div>
                          <div className={`flex items-center gap-1 ${
                            record.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {record.change >= 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            <span>
                              {record.change >= 0 ? '+' : ''}{record.changePercent?.toFixed(2) || '0.00'}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {(!priceHistory || Object.keys(priceHistory).length === 0) && (
                  <div className="text-center text-gray-500 py-8">
                    No price history available. Start the market simulator to see price changes.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Configuration Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Market Configuration</CardTitle>
            <CardDescription>
              Konfigurasi simulasi pasar berdasarkan tingkat risiko
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-green-600">Konservatif</h3>
                <p className="text-sm text-gray-600">Volatilitas: 2%</p>
                <p className="text-sm text-gray-600">Risiko rendah, pergerakan harga stabil</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-yellow-600">Moderat</h3>
                <p className="text-sm text-gray-600">Volatilitas: 5%</p>
                <p className="text-sm text-gray-600">Risiko sedang, pergerakan harga sedang</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-red-600">Agresif</h3>
                <p className="text-sm text-gray-600">Volatilitas: 10%</p>
                <p className="text-sm text-gray-600">Risiko tinggi, pergerakan harga volatile</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Algoritma Simulasi</h4>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>• 70% mengikuti expected return trend</li>
                <li>• 30% pergerakan random berdasarkan volatilitas</li>
                <li>• Harga minimum 1% dari harga asli (mencegah harga negatif)</li>
                <li>• Update otomatis portfolio dan return calculation</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
