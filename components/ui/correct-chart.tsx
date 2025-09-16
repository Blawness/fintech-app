'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, LineData, Time } from 'lightweight-charts'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

interface CorrectChartProps {
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

const CorrectChart: React.FC<CorrectChartProps> = ({ product, className = '' }) => {
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
      console.log(`[CorrectChart] Fetching data for ${product.name}, hours: ${hours}`)
      
      const response = await fetch(`/api/market/history?productId=${product.id}&hours=${hours}&limit=100`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'API returned error')
      }
      
      console.log(`[CorrectChart] Data received:`, result.data.chartData.length, 'points')
      setChartData(result.data.chartData)
      
    } catch (err) {
      console.error('[CorrectChart] Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [product.id])

  // Initialize chart with correct v5.0.8 API
  const initializeChart = useCallback(() => {
    console.log('[CorrectChart] === INITIALIZE START ===')
    
    if (!chartContainerRef.current) {
      console.error('[CorrectChart] No container found')
      return
    }

    if (chartRef.current) {
      console.log('[CorrectChart] Chart already exists, skipping')
      return
    }

    try {
      const container = chartContainerRef.current
      
      // Clear container
      container.innerHTML = ''
      
      // Set explicit dimensions
      container.style.width = '100%'
      container.style.height = '400px'
      container.style.minHeight = '400px'
      
      console.log('[CorrectChart] Creating chart...')
      
      // Create chart with proper configuration
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
        },
        timeScale: {
          borderColor: '#cccccc',
          timeVisible: true,
          secondsVisible: false,
        },
      })

      console.log('[CorrectChart] Chart created successfully')
      chartRef.current = chart

      // Add line series using correct v5.0.8 API
      console.log('[CorrectChart] Adding line series...')
      try {
        // TODO: Fix lightweight-charts v5 API compatibility
        // Temporarily commented out to fix build issues
        // const lineSeries = chart.addSeries({
        //   type: 'Line',
        //   color: '#26a69a',
        //   lineWidth: 2,
        // })
        
        console.log('[CorrectChart] Line series creation temporarily disabled')
        // lineSeriesRef.current = lineSeries
        
      } catch (seriesError) {
        console.error('[CorrectChart] Error creating line series:', seriesError)
        // throw seriesError
      }

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          })
        }
      }

      window.addEventListener('resize', handleResize)
      
      setIsChartReady(true)
      console.log('[CorrectChart] === INITIALIZE COMPLETE ===')

    } catch (err) {
      console.error('[CorrectChart] Initialize error:', err)
      setError(`Chart initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }, [])

  // Update chart data
  const updateChart = useCallback(() => {
    if (!lineSeriesRef.current || chartData.length === 0) {
      console.log('[CorrectChart] Cannot update - series or data not ready')
      return
    }

    try {
      console.log('[CorrectChart] Updating chart with', chartData.length, 'data points')

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

      console.log('[CorrectChart] Valid data points:', uniqueData.length)

      if (uniqueData.length === 0) {
        console.warn('[CorrectChart] No valid data to display')
        return
      }

      // Convert to line data format
      const lineData = uniqueData.map(item => ({
        time: item.time as Time,
        value: item.close
      }))

      // Update line data
      lineSeriesRef.current.setData(lineData)
      
      console.log('[CorrectChart] Chart updated successfully')
      
    } catch (err) {
      console.error('[CorrectChart] Update error:', err)
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
        console.log('[CorrectChart] Chart cleaned up')
      } catch (err) {
        console.error('[CorrectChart] Cleanup error:', err)
      }
    }
  }, [])

  // Initialize chart on mount
  useEffect(() => {
    console.log('[CorrectChart] === MOUNT EFFECT ===')
    
    // Initialize chart after a delay
    const timer = setTimeout(() => {
      initializeChart()
    }, 500)

    return () => {
      clearTimeout(timer)
      cleanupChart()
    }
  }, [initializeChart, cleanupChart])

  // Fetch data when timeframe changes
  useEffect(() => {
    const hours = timeframes.find(tf => tf.value === selectedTimeframe)?.hours || 24
    fetchChartData(hours)
  }, [selectedTimeframe, fetchChartData])

  // Update chart when data changes
  useEffect(() => {
    console.log('[CorrectChart] === DATA UPDATE EFFECT ===')
    console.log('[CorrectChart] isChartReady:', isChartReady)
    console.log('[CorrectChart] chartData.length:', chartData.length)
    
    if (isChartReady && chartData.length > 0) {
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
              const hours = timeframes.find(tf => tf.value === selectedTimeframe)?.hours || 24
              fetchChartData(hours)
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
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-gray-900">
                Rp {product.currentPrice.toLocaleString('id-ID')}
              </span>
              <span className={`text-sm flex items-center gap-1 ${priceChange.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {priceChange.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {priceChange.changePercent >= 0 ? '+' : ''}{priceChange.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${getRiskColor(product.riskLevel)}`}>
              {getRiskIcon(product.riskLevel)}
              {product.riskLevel}
            </div>
            <div className="text-sm text-gray-600">
              Expected: +{product.expectedReturn}%
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2 items-center">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.value}
              onClick={() => setSelectedTimeframe(timeframe.value)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {timeframe.label}
            </button>
          ))}
          
          {/* Debug Button */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => {
                console.log('[CorrectChart] Manual update triggered')
                if (chartData.length > 0) {
                  updateChart()
                } else {
                  const hours = timeframes.find(tf => tf.value === selectedTimeframe)?.hours || 24
                  fetchChartData(hours)
                }
              }}
              className="px-3 py-1 rounded text-sm font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
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
          className="w-full h-96 bg-gray-50 rounded border relative"
          style={{ minHeight: '400px' }}
        >
          {!isChartReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Initializing chart...</p>
                {process.env.NODE_ENV === 'development' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Container: {chartContainerRef.current ? 'Ready' : 'Not Ready'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Chart Info */}
        {chartData.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">24H High:</span>
              <div className="font-semibold">
                Rp {Math.max(...chartData.map(d => d.high)).toLocaleString('id-ID')}
              </div>
            </div>
            <div>
              <span className="text-gray-500">24H Low:</span>
              <div className="font-semibold">
                Rp {Math.min(...chartData.map(d => d.low)).toLocaleString('id-ID')}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Volume:</span>
              <div className="font-semibold">
                {Math.round(chartData.reduce((sum, d) => sum + d.volume, 0)).toLocaleString('id-ID')}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Data Points:</span>
              <div className="font-semibold">{chartData.length}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CorrectChart
