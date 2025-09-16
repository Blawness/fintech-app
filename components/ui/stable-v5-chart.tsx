'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, LineData } from 'lightweight-charts'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

interface StableV5ChartProps {
  product: {
    id: string
    name: string
    currentPrice: number
    riskLevel: string
    expectedReturn: number
    category: string
  }
  className?: string
}

interface ChartData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const StableV5Chart: React.FC<StableV5ChartProps> = ({ product, className = '' }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H')
  const [isChartReady, setIsChartReady] = useState(false)

  const timeframes = useMemo(() => ([
    { label: '1H', value: '1H', hours: 1 },
    { label: '4H', value: '4H', hours: 4 },
    { label: '1D', value: '1D', hours: 24 },
    { label: '1W', value: '1W', hours: 168 },
    { label: '1M', value: '1M', hours: 720 }
  ]), [])

  // Calculate price change
  const priceChange = React.useMemo(() => {
    if (chartData.length < 2) {
      return { change: 0, changePercent: 0 }
    }
    
    const current = chartData[chartData.length - 1].close
    const previous = chartData[chartData.length - 2].close
    const change = current - previous
    const changePercent = (change / previous) * 100
    
    return { change, changePercent }
  }, [chartData])

  // Fetch chart data
  const fetchChartData = useCallback(async (hours: number) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log(`[StableV5Chart] Fetching data for ${product.name}, hours: ${hours}`)
      
      const response = await fetch(`/api/market/history?productId=${product.id}&hours=${hours}&limit=100`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'API returned error')
      }
      
      console.log(`[StableV5Chart] Data received:`, result.data.chartData.length, 'points')
      setChartData(result.data.chartData)
      
    } catch (err) {
      console.error('[StableV5Chart] Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [product.id])

  // Wait for container to be ready
  const waitForContainer = useCallback((): Promise<HTMLDivElement> => {
    return new Promise((resolve, reject) => {
      let attempts = 0
      const maxAttempts = 20
      const checkInterval = 50

      const checkContainer = () => {
        attempts++
        console.log(`[StableV5Chart] Container check attempt ${attempts}/${maxAttempts}`)
        
        if (chartContainerRef.current) {
          console.log('[StableV5Chart] Container found!')
          resolve(chartContainerRef.current)
        } else if (attempts >= maxAttempts) {
          console.error('[StableV5Chart] Container not found after max attempts')
          reject(new Error('Container not found after maximum attempts'))
        } else {
          console.log('[StableV5Chart] Container not ready, retrying...')
          setTimeout(checkContainer, checkInterval)
        }
      }

      checkContainer()
    })
  }, [])

  // Initialize chart with correct v5.0 API
  const initializeChart = useCallback(async () => {
    console.log('[StableV5Chart] === INITIALIZE START ===')
    
    if (chartRef.current) {
      console.log('[StableV5Chart] Chart already exists, skipping')
      return
    }

    try {
      // Wait for container to be ready
      const container = await waitForContainer()
      
      console.log('[StableV5Chart] Creating chart...')
      
      const chart = createChart(container, {
        layout: {
          background: { type: ColorType.Solid, color: '#ffffff' },
          textColor: '#333333',
        },
        width: container.clientWidth || 800,
        height: 400,
        grid: {
          vertLines: { color: '#f0f0f0' },
          horzLines: { color: '#f0f0f0' },
        },
        rightPriceScale: {
          borderColor: '#cccccc',
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        timeScale: {
          borderColor: '#cccccc',
          timeVisible: true,
          secondsVisible: false,
        },
      })

      console.log('[StableV5Chart] Chart created successfully')
      chartRef.current = chart

      // Add line series using the most basic approach
      console.log('[StableV5Chart] Adding line series...')
      try {
        // Use the most basic approach - no options at all
        const lineSeries = chart.addSeries('Line')
        console.log('[StableV5Chart] Line series created successfully (basic)')
        lineSeriesRef.current = lineSeries
        
        // Apply styling after creation with a delay
        setTimeout(() => {
          try {
            lineSeries.applyOptions({
              color: '#26a69a',
              lineWidth: 2,
              priceLineVisible: true,
              lastValueVisible: true,
            })
            console.log('[StableV5Chart] Line series styled successfully')
          } catch (styleError) {
            console.warn('[StableV5Chart] Style application warning:', styleError)
          }
        }, 100)
        
      } catch (lineError) {
        console.error('[StableV5Chart] Line series error:', lineError)
        setError(`Failed to create line series: ${lineError instanceof Error ? lineError.message : 'Unknown error'}`)
        return
      }

      // Handle resize safely
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          try {
            chartRef.current.applyOptions({
              width: chartContainerRef.current.clientWidth,
            })
          } catch (resizeError) {
            console.warn('[StableV5Chart] Resize warning:', resizeError)
          }
        }
      }

      window.addEventListener('resize', handleResize)

      setIsChartReady(true)
      console.log('[StableV5Chart] === INITIALIZE COMPLETE ===')

    } catch (err) {
      console.error('[StableV5Chart] Initialize error:', err)
      setError(`Chart initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }, [waitForContainer])

  // Update chart data
  const updateChart = useCallback(() => {
    console.log('[StableV5Chart] === UPDATE CHART START ===')
    console.log('[StableV5Chart] lineSeriesRef.current:', lineSeriesRef.current)
    console.log('[StableV5Chart] chartData.length:', chartData.length)
    
    if (!lineSeriesRef.current) {
      console.log('[StableV5Chart] No line series available, cannot update')
      return
    }
    
    if (chartData.length === 0) {
      console.log('[StableV5Chart] No data available, cannot update')
      return
    }

    try {
      console.log('[StableV5Chart] Updating chart with', chartData.length, 'data points')

      // Sort and validate data
      const sortedData = [...chartData].sort((a, b) => a.time - b.time)
      const uniqueData = []
      const seenTimes = new Set()
      
      for (const item of sortedData) {
        if (!seenTimes.has(item.time) && 
            typeof item.time === 'number' && 
            item.time > 0 &&
            typeof item.close === 'number' &&
            !isNaN(item.close) &&
            item.close > 0) {
          seenTimes.add(item.time)
          uniqueData.push(item)
        }
      }

      console.log('[StableV5Chart] Valid data points:', uniqueData.length)

      if (uniqueData.length === 0) {
        console.warn('[StableV5Chart] No valid data to display')
        return
      }

      // Convert to line data format
      const lineData: LineData[] = uniqueData.map(item => ({
        time: item.time,
        value: item.close
      }))

      // Update line data
      lineSeriesRef.current.setData(lineData)
      
      console.log('[StableV5Chart] Chart updated successfully')
      console.log('[StableV5Chart] === UPDATE CHART COMPLETE ===')
      
    } catch (err) {
      console.error('[StableV5Chart] Update error:', err)
      setError(`Chart update failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }, [chartData])

  // Cleanup chart
  const cleanupChart = useCallback(() => {
    if (chartRef.current) {
      try {
        chartRef.current.remove()
        chartRef.current = null
        lineSeriesRef.current = null
        setIsChartReady(false)
        console.log('[StableV5Chart] Chart cleaned up')
      } catch (err) {
        console.error('[StableV5Chart] Cleanup error (non-critical):', err)
        // Reset refs anyway
        chartRef.current = null
        lineSeriesRef.current = null
        setIsChartReady(false)
      }
    }
  }, [])

  // Initialize chart on mount
  useEffect(() => {
    console.log('[StableV5Chart] === MOUNT EFFECT ===')
    
    // Initialize chart after a delay
    const timer = setTimeout(() => {
      initializeChart()
    }, 1000)

    return () => {
      clearTimeout(timer)
      cleanupChart()
    }
  }, [initializeChart, cleanupChart])

  // Fetch data when timeframe changes
  useEffect(() => {
    console.log('[StableV5Chart] Timeframe changed to:', selectedTimeframe)
    const hours = timeframes.find(tf => tf.value === selectedTimeframe)?.hours || 24
    fetchChartData(hours)
  }, [selectedTimeframe, fetchChartData])

  // Update chart when data changes
  useEffect(() => {
    console.log('[StableV5Chart] === DATA UPDATE EFFECT ===')
    console.log('[StableV5Chart] isChartReady:', isChartReady)
    console.log('[StableV5Chart] chartData.length:', chartData.length)
    console.log('[StableV5Chart] lineSeriesRef.current:', lineSeriesRef.current)
    
    if (isChartReady && chartData.length > 0 && lineSeriesRef.current) {
      console.log('[StableV5Chart] Updating chart with new data...')
      updateChart()
    }
  }, [chartData, isChartReady, updateChart])

  // Get risk color
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'KONSERVATIF': return 'text-green-600'
      case 'MODERAT': return 'text-yellow-600'
      case 'AGRESIF': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Get risk icon
  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'KONSERVATIF': return <TrendingUp className="h-4 w-4" />
      case 'MODERAT': return <BarChart3 className="h-4 w-4" />
      case 'AGRESIF': return <TrendingDown className="h-4 w-4" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chart data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">Product: {product.name}</p>
          <button 
            onClick={() => {
              setError(null)
              const hours = timeframes.find(tf => tf.value === selectedTimeframe)?.hours || 24
              fetchChartData(hours)
              initializeChart()
            }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-2 bg-gray-100 text-xs text-gray-600 border-b">
          Chart: {isChartReady ? 'Ready' : 'Not Ready'} | 
          Data: {chartData.length} | 
          Timeframe: {selectedTimeframe} | 
          Loading: {loading ? 'Yes' : 'No'}
        </div>
      )}
      
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">
                Rp {product.currentPrice.toLocaleString('id-ID')}
              </span>
              <span className={`text-lg flex items-center gap-1 px-3 py-1 rounded-full ${priceChange.change >= 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                {priceChange.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {priceChange.changePercent >= 0 ? '+' : ''}{priceChange.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getRiskColor(product.riskLevel)} bg-white shadow-sm`}>
              {getRiskIcon(product.riskLevel)}
              {product.riskLevel}
            </div>
            <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
              Expected: +{product.expectedReturn}%
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-3 items-center">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.value}
              onClick={() => setSelectedTimeframe(timeframe.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTimeframe === timeframe.value
                  ? 'bg-blue-600 text-white shadow-md transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm border border-gray-200'
              }`}
            >
              {timeframe.label}
            </button>
          ))}
          
          {/* Debug Button */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => {
                console.log('[StableV5Chart] Manual update triggered')
                if (chartData.length > 0) {
                  updateChart()
                } else {
                  const hours = timeframes.find(tf => tf.value === selectedTimeframe)?.hours || 24
                  fetchChartData(hours)
                }
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300"
            >
              Force Update
            </button>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <div className="p-4">
        <div 
          ref={chartContainerRef} 
          className="w-full bg-white rounded-lg border-2 border-gray-200 relative overflow-hidden"
          style={{ 
            height: '450px',
            minHeight: '450px',
            maxHeight: '450px'
          }}
        >
          {!isChartReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Initializing chart...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Chart Info */}
        {chartData.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-gray-500 text-xs uppercase tracking-wide">24H High</span>
              <div className="font-bold text-lg text-green-600">
                Rp {Math.max(...chartData.map(d => d.high)).toLocaleString('id-ID')}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-gray-500 text-xs uppercase tracking-wide">24H Low</span>
              <div className="font-bold text-lg text-red-600">
                Rp {Math.min(...chartData.map(d => d.low)).toLocaleString('id-ID')}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-gray-500 text-xs uppercase tracking-wide">Volume</span>
              <div className="font-bold text-lg text-blue-600">
                {Math.round(chartData.reduce((sum, d) => sum + d.volume, 0)).toLocaleString('id-ID')}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-gray-500 text-xs uppercase tracking-wide">Data Points</span>
              <div className="font-bold text-lg text-purple-600">{chartData.length}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StableV5Chart
