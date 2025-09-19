'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, RefreshCw, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import MinimalisticLineChart from '@/components/ui/minimalistic-line-chart'

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

interface Product {
  id: string
  name: string
  currentPrice: number
  riskLevel: string
  expectedReturn: number
  category: string
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

interface MarketConfig {
  riskVolatility: {
    KONSERVATIF: number
    MODERAT: number
    AGRESIF: number
  }
  typeVolatility: {
    PASAR_UANG: number
    OBLIGASI: number
    CAMPURAN: number
    SAHAM: number
  }
  marketTrendFactor: number
  randomFactor: number
  meanReversionFactor: number
  minPriceFloor: number
  simulationInterval: number
}

export default function MarketControlPage() {
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<ProductUpdate[]>([])
  const [priceHistory, setPriceHistory] = useState<Record<string, ProductHistory>>({})
  const [interval, setInterval] = useState(10000)
  const [showHistory, setShowHistory] = useState(false)
  const [pollingInterval, setPollingInterval] = useState<number | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [demoProduct, setDemoProduct] = useState<Product | null>(null)
  const [marketConfig, setMarketConfig] = useState<MarketConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [tempConfig, setTempConfig] = useState<MarketConfig | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const statusIntervalRef = useRef<number | null>(null)

  const fetchMarketStatus = async () => {
    try {
      const response = await fetch('/api/market/control')
      const data = await response.json()
      setMarketStatus({
        isRunning: Boolean(data?.isRunning),
        timestamp: data?.timestamp || new Date().toISOString()
      })
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

  const fetchDemoProduct = async () => {
    try {
      const response = await fetch('/api/products')
      const products = await response.json()
      if (products && products.length > 0) {
        // Use the first product as demo
        setDemoProduct(products[0])
      }
    } catch (error) {
      console.error('Error fetching demo product:', error)
    }
  }

  const fetchMarketConfig = async () => {
    try {
      setConfigLoading(true)
      const response = await fetch('/api/admin/market-config')
      const data = await response.json()
      if (data.success) {
        setMarketConfig(data.config)
        setTempConfig(data.config)
        setHasUnsavedChanges(false)
      }
    } catch (error) {
      console.error('Error fetching market configuration:', error)
    } finally {
      setConfigLoading(false)
    }
  }

  // Removed unused updateMarketConfig function

  const updateTempConfig = (
    key: keyof MarketConfig,
    value: MarketConfig[keyof MarketConfig]
  ) => {
    if (tempConfig) {
      const newTempConfig = { ...tempConfig, [key]: value }
      setTempConfig(newTempConfig)
      setHasUnsavedChanges(true)
    }
  }

  const saveConfiguration = async () => {
    if (!tempConfig) return

    try {
      setConfigLoading(true)
      const response = await fetch('/api/admin/market-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config: tempConfig }),
      })
      
      const data = await response.json()
      if (data.success) {
        setMarketConfig(tempConfig)
        setHasUnsavedChanges(false)
        
        // Refresh market simulator configuration if it's running
        if (marketStatus?.isRunning) {
          try {
            await fetch('/api/market/control', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ action: 'refresh_config' }),
            })
          } catch (error) {
            console.error('Error refreshing market simulator config:', error)
          }
        }
        
        alert('Configuration saved successfully!')
      } else {
        alert(data.error || 'Error saving configuration')
      }
    } catch (error) {
      console.error('Error saving configuration:', error)
      alert('Error saving configuration')
    } finally {
      setConfigLoading(false)
    }
  }

  const resetToSaved = () => {
    if (marketConfig) {
      setTempConfig(marketConfig)
      setHasUnsavedChanges(false)
    }
  }

  const resetToDefaults = async () => {
    if (confirm('Are you sure you want to reset to default configuration? This will discard all unsaved changes.')) {
      await fetchMarketConfig()
    }
  }

  const controlMarket = async (action: string) => {
    // Prevent multiple simultaneous requests
    if (isLoading) {
      return
    }
    
    setIsLoading(true)
    try {
      let response
      
      if (action === 'start') {
        // Stop any existing polling first
        stopPolling()
        
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
        console.error('Market control error:', data.error)
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

  const stopPolling = useCallback(() => {
    setPollingInterval((current) => {
      if (current) {
        window.clearInterval(current)
      }
      return null
    })
  }, [])

  const startPolling = useCallback(() => {
    // Clear any existing polling first
    stopPolling()
    
    const pollInterval = window.setInterval(() => {
      (async () => {
        try {
          await fetchMarketStatus()
        } catch (error) {
          console.error('Error polling market status:', error)
        }
      })()
    }, 5000) // Poll every 5 seconds

    setPollingInterval(pollInterval)
  }, [stopPolling])

  // stopPolling moved above and memoized

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    fetchMarketStatus()
    fetchPriceHistory()
    fetchDemoProduct()
    fetchMarketConfig()
    
    // Poll status every 3 seconds to detect changes
    statusIntervalRef.current = window.setInterval(() => {
      fetchMarketStatus()
    }, 3000)
    
    // Cleanup on unmount
    return () => {
      stopPolling()
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current)
        statusIntervalRef.current = null
      }
    }
  }, [stopPolling])

  // Add effect to sync polling with market status
  useEffect(() => {
    if (marketStatus?.isRunning && !pollingInterval) {
      startPolling()
    } else if (!marketStatus?.isRunning && pollingInterval) {
      stopPolling()
    }
  }, [marketStatus?.isRunning, pollingInterval, startPolling, stopPolling])

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
                    {marketStatus?.timestamp && isClient ? new Date(marketStatus.timestamp).toLocaleString() : 'N/A'}
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
                    {isLoading ? 'Starting...' : 'Start'}
                  </Button>
                  <Button
                    onClick={() => controlMarket('stop')}
                    disabled={isLoading || !marketStatus?.isRunning}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    {isLoading ? 'Stopping...' : 'Stop'}
                  </Button>
                  <Button
                    onClick={simulateMarket}
                    disabled={isLoading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Simulating...' : 'Simulate Once'}
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
                    disabled={isLoading}
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
                              {isClient ? new Date(record.timestamp).toLocaleTimeString() : 'Loading...'}
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

        {/* Minimalistic Chart Demo */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Minimalistic Line Chart Demo</CardTitle>
            <CardDescription>
              Demonstrasi UI line chart yang minimalistic untuk produk investasi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Chart minimalistic ini menggunakan line chart sederhana tanpa elemen candlestick, 
                fokus pada tampilan yang bersih dan mudah dibaca.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Sample Chart</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Berikut adalah contoh chart minimalistic untuk produk investasi:
                </p>
                {demoProduct ? (
                  <MinimalisticLineChart 
                    product={{
                      id: demoProduct.id,
                      name: demoProduct.name,
                      currentPrice: demoProduct.currentPrice,
                      riskLevel: demoProduct.riskLevel,
                      expectedReturn: demoProduct.expectedReturn,
                      category: demoProduct.category
                    }}
                    className="w-full"
                  />
                ) : (
                  <MinimalisticLineChart 
                    product={{
                      id: 'demo',
                      name: 'Sample Investment Product',
                      currentPrice: 150000,
                      riskLevel: 'MODERAT',
                      expectedReturn: 12.5,
                      category: 'Technology'
                    }}
                    className="w-full"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Configuration Controls */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Market Configuration</span>
              <Button
                onClick={() => setShowConfig(!showConfig)}
                variant="outline"
                size="sm"
              >
                {showConfig ? 'Hide' : 'Show'} Configuration
              </Button>
            </CardTitle>
            <CardDescription>
              Konfigurasi simulasi pasar berdasarkan tingkat risiko
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showConfig && tempConfig ? (
              <div className="space-y-6">
                {/* Risk Volatility Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Risk Level Volatility</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(tempConfig.riskVolatility).map(([level, value]) => (
                      <div key={level} className="p-4 border rounded-lg">
                        <h4 className={`font-medium ${
                          level === 'KONSERVATIF' ? 'text-green-600' :
                          level === 'MODERAT' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {level}
                        </h4>
                        <div className="mt-2 space-y-2">
                          <label className="text-sm text-gray-600">Volatility:</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => {
                                const newValue = parseFloat(e.target.value)
                                if (!isNaN(newValue)) {
                                  updateTempConfig('riskVolatility', {
                                    ...tempConfig.riskVolatility,
                                    [level]: newValue
                                  })
                                }
                              }}
                              className="w-20 px-2 py-1 border rounded text-sm"
                              min="0"
                              max="1"
                              step="0.0001"
                            />
                            <span className="text-sm text-gray-500">({(value * 100).toFixed(3)}%)</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Type Volatility Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Product Type Volatility Multipliers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(tempConfig.typeVolatility).map(([type, value]) => (
                      <div key={type} className="p-4 border rounded-lg">
                        <h4 className="font-medium text-gray-700">{type}</h4>
                        <div className="mt-2 space-y-2">
                          <label className="text-sm text-gray-600">Multiplier:</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => {
                                const newValue = parseFloat(e.target.value)
                                if (!isNaN(newValue)) {
                                  updateTempConfig('typeVolatility', {
                                    ...tempConfig.typeVolatility,
                                    [type]: newValue
                                  })
                                }
                              }}
                              className="w-20 px-2 py-1 border rounded text-sm"
                              min="0"
                              max="5"
                              step="0.1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Algorithm Factors */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Algorithm Factors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg">
                      <label className="text-sm font-medium text-gray-700">Market Trend Factor</label>
                      <div className="mt-2">
                        <input
                          type="number"
                          value={tempConfig.marketTrendFactor}
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value)
                            if (!isNaN(newValue)) {
                              updateTempConfig('marketTrendFactor', newValue)
                            }
                          }}
                          className="w-full px-2 py-1 border rounded text-sm"
                          min="0"
                          max="1"
                          step="0.01"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {(tempConfig.marketTrendFactor * 100).toFixed(0)}% follow expected return
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <label className="text-sm font-medium text-gray-700">Random Factor</label>
                      <div className="mt-2">
                        <input
                          type="number"
                          value={tempConfig.randomFactor}
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value)
                            if (!isNaN(newValue)) {
                              updateTempConfig('randomFactor', newValue)
                            }
                          }}
                          className="w-full px-2 py-1 border rounded text-sm"
                          min="0"
                          max="1"
                          step="0.01"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {(tempConfig.randomFactor * 100).toFixed(0)}% random movement
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <label className="text-sm font-medium text-gray-700">Mean Reversion Factor</label>
                      <div className="mt-2">
                        <input
                          type="number"
                          value={tempConfig.meanReversionFactor}
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value)
                            if (!isNaN(newValue)) {
                              updateTempConfig('meanReversionFactor', newValue)
                            }
                          }}
                          className="w-full px-2 py-1 border rounded text-sm"
                          min="0"
                          max="1"
                          step="0.01"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {(tempConfig.meanReversionFactor * 100).toFixed(0)}% mean reversion
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <label className="text-sm font-medium text-gray-700">Min Price Floor</label>
                      <div className="mt-2">
                        <input
                          type="number"
                          value={tempConfig.minPriceFloor}
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value)
                            if (!isNaN(newValue)) {
                              updateTempConfig('minPriceFloor', newValue)
                            }
                          }}
                          className="w-full px-2 py-1 border rounded text-sm"
                          min="0"
                          max="1"
                          step="0.01"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {(tempConfig.minPriceFloor * 100).toFixed(0)}% of original price
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulation Interval */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Simulation Settings</h3>
                  <div className="p-4 border rounded-lg">
                    <label className="text-sm font-medium text-gray-700">Simulation Interval (ms)</label>
                    <div className="mt-2">
                      <input
                        type="number"
                        value={tempConfig.simulationInterval}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value)
                          if (!isNaN(newValue)) {
                            updateTempConfig('simulationInterval', newValue)
                          }
                        }}
                        className="w-32 px-2 py-1 border rounded text-sm"
                        min="1000"
                        max="300000"
                        step="1000"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {tempConfig.simulationInterval / 1000} seconds between updates
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      onClick={resetToSaved}
                      variant="outline"
                      disabled={!hasUnsavedChanges || configLoading}
                    >
                      Reset to Saved
                    </Button>
                    <Button
                      onClick={resetToDefaults}
                      variant="outline"
                      disabled={configLoading}
                    >
                      Reset to Defaults
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {hasUnsavedChanges && (
                      <span className="text-sm text-orange-600 font-medium">
                        You have unsaved changes
                      </span>
                    )}
                    <Button
                      onClick={saveConfiguration}
                      disabled={!hasUnsavedChanges || configLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {configLoading ? 'Saving...' : 'Save Configuration'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : showConfig && configLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-gray-600">Loading configuration...</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Click &quot;Show Configuration&quot; to view and edit market settings</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
