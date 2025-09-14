'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, HistogramData } from 'lightweight-charts'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

interface TradingChartProps {
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

const TradingChart: React.FC<TradingChartProps> = ({ product, className = '' }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H')
  const [isChartReady, setIsChartReady] = useState(false)

  const timeframes = [
    { label: '1H', value: '1H', hours: 1 },
    { label: '4H', value: '4H', hours: 4 },
    { label: '1D', value: '1D', hours: 24 },
    { label: '1W', value: '1W', hours: 168 },
    { label: '1M', value: '1M', hours: 720 }
  ]

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
      console.log(`Fetching chart data for ${product.name}, hours: ${hours}`)
      
      const response = await fetch(`/api/market/history?productId=${product.id}&hours=${hours}&limit=100`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chart data: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch chart data')
      }
      
      console.log('Chart data received:', result.data.chartData.length, 'points')
      setChartData(result.data.chartData)
      
    } catch (err) {
      console.error('Error fetching chart data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data')
    } finally {
      setLoading(false)
    }
  }, [product.id])

  // Initialize chart
  const initializeChart = useCallback(() => {
    if (!chartContainerRef.current) {
      console.error('Chart container not found')
      return
    }

    if (chartRef.current) {
      console.log('Chart already exists, cleaning up first')
      cleanupChart()
    }

    try {
      console.log('Initializing chart...')
      
      // Clean up container
      const container = chartContainerRef.current
      container.innerHTML = ''
      container.style.width = '100%'
      container.style.height = '400px'
      container.style.minHeight = '400px'

      // Create chart
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
        crosshair: {
          mode: 1,
        },
        rightPriceScale: {
          borderColor: '#cccccc',
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
          tickMarkFormatter: (price: number) => {
            return `Rp ${price.toLocaleString('id-ID')}`
          },
        },
        timeScale: {
          borderColor: '#cccccc',
          timeVisible: true,
          secondsVisible: false,
          tickMarkFormatter: (time: any) => {
            const date = new Date(time * 1000)
            return date.toLocaleTimeString('id-ID', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          },
        },
      })

      chartRef.current = chart

      // Add candlestick series using the correct method
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderDownColor: '#ef5350',
        borderUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        wickUpColor: '#26a69a',
      })
      candlestickSeriesRef.current = candlestickSeries

      // Add volume series using the correct method
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      })
      volumeSeriesRef.current = volumeSeries

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
      console.log('Chart initialized successfully')

    } catch (err) {
      console.error('Error initializing chart:', err)
      setError('Failed to initialize chart')
    }
  }, [])

  // Update chart data
  const updateChart = useCallback(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current || chartData.length === 0) {
      console.log('Chart series not ready or no data')
      return
    }

    try {
      console.log('Updating chart with data:', chartData.length, 'points')

      // Sort and validate data
      const sortedData = [...chartData].sort((a, b) => a.time - b.time)
      const uniqueData = []
      const seenTimes = new Set()
      
      for (const item of sortedData) {
        if (!seenTimes.has(item.time) && 
            typeof item.time === 'number' && 
            item.time > 0 &&
            typeof item.open === 'number' &&
            typeof item.high === 'number' &&
            typeof item.low === 'number' &&
            typeof item.close === 'number') {
          seenTimes.add(item.time)
          uniqueData.push(item)
        }
      }

      console.log('Valid data points:', uniqueData.length)

      if (uniqueData.length === 0) {
        console.warn('No valid data points to display')
        return
      }

      // Convert to candlestick data format
      const candlestickData: CandlestickData[] = uniqueData.map(item => ({
        time: item.time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close
      }))

      // Update candlestick data
      candlestickSeriesRef.current.setData(candlestickData)

      // Update volume data
      const volumeData: HistogramData[] = uniqueData.map(item => ({
        time: item.time,
        value: item.volume,
        color: item.close >= item.open ? '#26a69a' : '#ef5350'
      }))
      
      volumeSeriesRef.current.setData(volumeData)
      
      console.log('Chart updated successfully')
      
    } catch (err) {
      console.error('Error updating chart:', err)
      setError('Failed to update chart')
    }
  }, [chartData])

  // Cleanup chart
  const cleanupChart = useCallback(() => {
    if (chartRef.current) {
      try {
        chartRef.current.remove()
        chartRef.current = null
        candlestickSeriesRef.current = null
        volumeSeriesRef.current = null
        setIsChartReady(false)
        console.log('Chart cleaned up')
      } catch (err) {
        console.error('Error cleaning up chart:', err)
      }
    }
  }, [])

  // Initialize chart on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeChart()
    }, 100)

    return () => {
      clearTimeout(timer)
      cleanupChart()
    }
  }, [product.id, initializeChart, cleanupChart])

  // Fetch data when timeframe changes
  useEffect(() => {
    const hours = timeframes.find(tf => tf.value === selectedTimeframe)?.hours || 24
    fetchChartData(hours)
  }, [selectedTimeframe, product.id, fetchChartData])

  // Update chart when data changes
  useEffect(() => {
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
        <div className="flex gap-2">
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
        </div>
      </div>

      {/* Chart Container */}
      <div className="p-4">
        <div 
          ref={chartContainerRef} 
          className="w-full h-96 bg-gray-50 rounded border"
          style={{ minHeight: '400px' }}
        />
        
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

export default TradingChart
