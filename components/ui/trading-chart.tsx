'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, BarSeries, HistogramSeries } from 'lightweight-charts'
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react'

interface ChartData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface BarData {
  time: number
  open: number
  high: number
  low: number
  close: number
}

interface Product {
  id: string
  name: string
  currentPrice: number
  expectedReturn: number
  riskLevel: string
  category: string
}

interface TradingChartProps {
  product: Product
  className?: string
}

export function TradingChart({ product, className = '' }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H')
  const [priceChange, setPriceChange] = useState({ change: 0, changePercent: 0 })

  const timeframes = [
    { label: '1H', value: '1H', hours: 1 },
    { label: '4H', value: '4H', hours: 4 },
    { label: '1D', value: '1D', hours: 24 },
    { label: '1W', value: '1W', hours: 168 },
    { label: '1M', value: '1M', hours: 720 }
  ]

  const fetchChartData = async (hours: number = 24) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching chart data for product:', product.id, 'hours:', hours)
      
      const response = await fetch(`/api/market/history?productId=${product.id}&hours=${hours}&limit=100`)
      const data = await response.json()
      
      console.log('Chart data response:', data)
      
      if (data.success) {
        console.log('Chart data received:', data.data.chartData.length, 'points')
        setChartData(data.data.chartData)
        
        // Calculate price change
        if (data.data.chartData.length > 1) {
          const firstPrice = data.data.chartData[0].close
          const lastPrice = data.data.chartData[data.data.chartData.length - 1].close
          const change = lastPrice - firstPrice
          const changePercent = (change / firstPrice) * 100
          setPriceChange({ change, changePercent })
        }
      } else {
        console.error('Chart data error:', data.error)
        setError(data.error || 'Failed to fetch chart data')
      }
    } catch (err) {
      console.error('Error fetching chart data:', err)
      setError('Failed to fetch chart data')
    } finally {
      setLoading(false)
    }
  }

  const initializeChart = () => {
    if (!chartContainerRef.current) {
      console.error('Chart container not found')
      return
    }

    // Clean up any existing chart first
    if (chartRef.current) {
      console.log('Cleaning up existing chart')
      cleanupChart()
    }

    console.log('Initializing chart...')
    
    // Ensure container has proper dimensions
    const container = chartContainerRef.current
    container.style.width = '100%'
    container.style.height = '400px'
    container.style.minHeight = '400px'
    container.innerHTML = '' // Clear any existing content

    console.log('Container dimensions:', container.clientWidth, container.clientHeight)

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
        drawTicks: true,
        drawLabels: true,
        tickMarkFormatter: (price: number) => {
          return `Rp ${price.toLocaleString('id-ID')}`
        },
      },
      timeScale: {
        borderColor: '#cccccc',
        timeVisible: true,
        secondsVisible: false,
        drawTicks: true,
        drawLabels: true,
        tickMarkFormatter: (time: any, tickMarkType: any, locale: string) => {
          const date = new Date(time * 1000)
          return date.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        },
      },
    })

    console.log('Chart object created successfully')

    let candlestickSeries, volumeSeries

    try {
      // Create candlestick series (using addSeries with BarSeries in v5+)
      candlestickSeries = chart.addSeries(BarSeries, {
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderDownColor: '#ef5350',
        borderUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        wickUpColor: '#26a69a',
      })

      // Create volume series (using addSeries with HistogramSeries in v5+)
      volumeSeries = chart.addSeries(HistogramSeries, {
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        overlay: true,
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      })

      console.log('Chart series created successfully')
    } catch (error) {
      console.error('Error creating chart series:', error)
      throw error
    }

    chartRef.current = chart
    candlestickSeriesRef.current = candlestickSeries
    volumeSeriesRef.current = volumeSeries

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }

  const updateChart = () => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current) {
      console.log('Chart series not ready yet')
      return
    }

    if (chartData.length === 0) {
      console.log('No chart data to display')
      return
    }

    console.log('Updating chart with data:', chartData.length, 'points')

    // Sort data by time in ascending order (required by TradingView)
    const sortedData = [...chartData].sort((a, b) => a.time - b.time)
    
    // Remove duplicate timestamps and validate data
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

    console.log('Sorted data points:', uniqueData.length)

    // Convert to bar data format for v5+
    const barData: BarData[] = uniqueData.map(item => ({
      time: item.time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close
    }))

    // Update candlestick data
    try {
      candlestickSeriesRef.current.setData(barData)
      console.log('Candlestick data updated successfully')
    } catch (error) {
      console.error('Error updating candlestick data:', error)
      return
    }

    // Update volume data
    const volumeData = uniqueData.map(item => ({
      time: item.time,
      value: item.volume,
      color: item.close >= item.open ? '#26a69a' : '#ef5350'
    }))
    
    try {
      volumeSeriesRef.current.setData(volumeData)
      console.log('Volume data updated successfully')
    } catch (error) {
      console.error('Error updating volume data:', error)
    }
    
    console.log('Chart updated successfully')
  }

  useEffect(() => {
    // Initialize chart after a small delay to ensure container is ready
    const timer = setTimeout(() => {
      if (chartContainerRef.current && !chartRef.current) {
        console.log('Initializing chart for product:', product.id)
        initializeChart()
      }
    }, 200)

    return () => {
      clearTimeout(timer)
      cleanupChart()
    }
  }, [product.id])

  useEffect(() => {
    if (chartData.length > 0 && chartRef.current && candlestickSeriesRef.current && volumeSeriesRef.current) {
      console.log('Chart data updated, updating chart...')
      updateChart()
    }
  }, [chartData])

  useEffect(() => {
    const hours = timeframes.find(tf => tf.value === selectedTimeframe)?.hours || 24
    console.log('Timeframe changed to:', selectedTimeframe, 'hours:', hours)
    fetchChartData(hours)
  }, [selectedTimeframe, product.id])

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'KONSERVATIF': return 'text-green-600'
      case 'MODERAT': return 'text-yellow-600'
      case 'AGRESIF': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'KONSERVATIF': return <TrendingUp className="h-4 w-4" />
      case 'MODERAT': return <BarChart3 className="h-4 w-4" />
      case 'AGRESIF': return <Activity className="h-4 w-4" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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

  // Show fallback if no chart data and not loading
  if (!loading && chartData.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="text-gray-500 mb-4">📊</div>
          <p className="text-gray-600">No chart data available</p>
          <p className="text-sm text-gray-500 mt-2">Product: {product.name}</p>
          <button 
            onClick={() => fetchChartData()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Load Chart
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
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
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setSelectedTimeframe(tf.value)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                selectedTimeframe === tf.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="p-6">
        <div 
          ref={chartContainerRef} 
          className="w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm" 
          style={{ 
            height: '450px', 
            minHeight: '450px',
            width: '100%'
          }} 
        />
        
        {/* Chart Info */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-3 bg-gray-50 rounded-lg border">
            <div className="text-gray-600 text-xs mb-1">24H High</div>
            <div className="font-semibold text-sm">
              Rp {chartData.length > 0 ? Math.max(...chartData.map(d => d.high)).toLocaleString('id-ID') : 'N/A'}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg border">
            <div className="text-gray-600 text-xs mb-1">24H Low</div>
            <div className="font-semibold text-sm">
              Rp {chartData.length > 0 ? Math.min(...chartData.map(d => d.low)).toLocaleString('id-ID') : 'N/A'}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg border">
            <div className="text-gray-600 text-xs mb-1">Volume</div>
            <div className="font-semibold text-sm">
              {chartData.length > 0 ? chartData.reduce((sum, d) => sum + d.volume, 0).toFixed(0) : 'N/A'}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg border">
            <div className="text-gray-600 text-xs mb-1">Data Points</div>
            <div className="font-semibold text-sm">{chartData.length}</div>
          </div>
        </div>

      </div>
    </div>
  )
}
