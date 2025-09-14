'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts'
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react'

interface ChartData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
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
      
      const response = await fetch(`/api/market/history?productId=${product.id}&hours=${hours}&limit=100`)
      const data = await response.json()
      
      if (data.success) {
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
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#333333',
      },
      width: chartContainerRef.current.clientWidth,
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
      },
      timeScale: {
        borderColor: '#cccccc',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderDownColor: '#ef5350',
      borderUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      wickUpColor: '#26a69a',
    })

    // Create volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
    })

    chartRef.current = chart
    candlestickSeriesRef.current = candlestickSeries
    volumeSeriesRef.current = volumeSeries

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }

  const updateChart = () => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return

    // Update candlestick data
    candlestickSeriesRef.current.setData(chartData)

    // Update volume data
    const volumeData = chartData.map(item => ({
      time: item.time,
      value: item.volume,
      color: item.close >= item.open ? '#26a69a' : '#ef5350'
    }))
    volumeSeriesRef.current.setData(volumeData)
  }

  useEffect(() => {
    const cleanup = initializeChart()
    return cleanup
  }, [])

  useEffect(() => {
    updateChart()
  }, [chartData])

  useEffect(() => {
    const hours = timeframes.find(tf => tf.value === selectedTimeframe)?.hours || 24
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
          <button 
            onClick={() => fetchChartData()}
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
      <div className="p-4">
        <div ref={chartContainerRef} className="w-full" style={{ height: '400px' }} />
        
        {/* Chart Info */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-gray-600">24H High</div>
            <div className="font-semibold">
              Rp {Math.max(...chartData.map(d => d.high)).toLocaleString('id-ID')}
            </div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-gray-600">24H Low</div>
            <div className="font-semibold">
              Rp {Math.min(...chartData.map(d => d.low)).toLocaleString('id-ID')}
            </div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-gray-600">Volume</div>
            <div className="font-semibold">
              {chartData.reduce((sum, d) => sum + d.volume, 0).toFixed(0)}
            </div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-gray-600">Data Points</div>
            <div className="font-semibold">{chartData.length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
