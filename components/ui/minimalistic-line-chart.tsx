'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, LineData, LineSeries, Time } from 'lightweight-charts'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

interface MinimalisticLineChartProps {
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
  value: number
}

const MinimalisticLineChart: React.FC<MinimalisticLineChartProps> = ({ product, className = '' }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D')
  const [isChartReady, setIsChartReady] = useState(false)

  const timeframes = useMemo(() => ([
    { label: '1D', value: '1D', hours: 24 },
    { label: '5D', value: '5D', hours: 120 },
    { label: '1M', value: '1M', hours: 720 },
    { label: '6M', value: '6M', hours: 4320 },
    { label: 'YTD', value: 'YTD', hours: 8760 },
    { label: '1Y', value: '1Y', hours: 8760 },
    { label: '5Y', value: '5Y', hours: 43800 },
    { label: 'MAX', value: 'MAX', hours: 87600 }
  ]), [])

  // Calculate price change
  const priceChange = React.useMemo(() => {
    if (chartData.length < 2) {
      return { change: 0, changePercent: 0 }
    }
    
    const current = chartData[chartData.length - 1].value
    const previous = chartData[chartData.length - 2].value
    const change = current - previous
    const changePercent = (change / previous) * 100
    
    return { change, changePercent }
  }, [chartData])

  // Fetch chart data
  const fetchChartData = useCallback(async (hours: number) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log(`[MinimalisticLineChart] Fetching data for ${product.name}, hours: ${hours}`)
      
      const response = await fetch(`/api/market/history?productId=${product.id}&hours=${hours}&limit=100`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'API returned error')
      }
      
      // Convert candlestick data to line data - ensure it's line chart only
      const lineData: ChartData[] = result.data.chartData.map((item: any) => ({
        time: item.time,
        value: item.close // Only use close price for line chart
      }))
      
      console.log(`[MinimalisticLineChart] Data received:`, lineData.length, 'points')
      setChartData(lineData)
      
    } catch (err) {
      console.error('[MinimalisticLineChart] Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [product.id, product.name])

  // Wait for container to be ready
  const waitForContainer = useCallback((): Promise<HTMLDivElement> => {
    return new Promise((resolve, reject) => {
      let attempts = 0
      const maxAttempts = 20
      const checkInterval = 50

      const checkContainer = () => {
        attempts++
        
        if (chartContainerRef.current) {
          resolve(chartContainerRef.current)
        } else if (attempts >= maxAttempts) {
          reject(new Error('Container not found after maximum attempts'))
        } else {
          setTimeout(checkContainer, checkInterval)
        }
      }

      checkContainer()
    })
  }, [])

  // Initialize chart
  const initializeChart = useCallback(async () => {
    if (chartRef.current) {
      return
    }

    try {
      const container = await waitForContainer()
      
      const chart = createChart(container, {
        layout: {
          background: { type: ColorType.Solid, color: '#ffffff' },
          textColor: '#333333',
        },
        width: container.clientWidth || 800,
        height: 450,
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
          autoScale: true,
          alignLabels: true,
          visible: true,
          entireTextOnly: true,
          lockScale: true, // Lock price scale
        },
        timeScale: {
          borderColor: '#cccccc',
          timeVisible: true,
          secondsVisible: false,
          rightOffset: 12,
          barSpacing: 3,
          lockVisibleTimeRangeOnResize: true,
          rightBarStaysOnScroll: true,
          shiftVisibleRangeOnNewBar: true,
          visible: true,
          fixLeftEdge: true, // Fix left edge
          fixRightEdge: true, // Fix right edge
          lockVisibleTimeRangeOnResize: true,
          tickMarkFormatter: (time: any, tickMarkType: any, locale: string) => {
            const date = new Date(time * 1000)
            return date.toLocaleDateString('id-ID', { 
              month: 'short', 
              day: 'numeric' 
            })
          },
        },
        crosshair: {
          mode: 0, // Disable crosshair for fixed layout
          vertLine: {
            color: '#888',
            width: 1,
            style: 2,
            labelBackgroundColor: '#f0f0f0',
          },
          horzLine: {
            color: '#888',
            width: 1,
            style: 2,
            labelBackgroundColor: '#f0f0f0',
          },
        },
        handleScroll: {
          mouseWheel: false, // Disable mouse wheel scrolling
          pressedMouseMove: false, // Disable drag scrolling
          horzTouchDrag: false, // Disable horizontal touch drag
          vertTouchDrag: false, // Disable vertical touch drag
        },
        handleScale: {
          axisPressedMouseMove: false, // Disable axis drag scaling
          mouseWheel: false, // Disable mouse wheel zooming
          pinch: false, // Disable pinch zoom
        },
      })

      chartRef.current = chart

      // Add line series - minimalistic line chart only (NO CANDLESTICK)
      console.log('[MinimalisticLineChart] Creating LineSeries (not CandlestickSeries)')
      const lineSeries = chart.addSeries(LineSeries, {
        color: '#22c55e',
        lineWidth: 3,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false, // Disable crosshair markers for fixed layout
        crosshairMarkerRadius: 6,
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      })
      
      console.log('[MinimalisticLineChart] LineSeries created successfully')
      
      lineSeriesRef.current = lineSeries

      // Handle resize - Fixed layout
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          try {
            const containerWidth = chartContainerRef.current.clientWidth
            chartRef.current.applyOptions({
              width: containerWidth,
              height: 450, // Fixed height
            })
          } catch (resizeError) {
            console.warn('[MinimalisticLineChart] Resize warning:', resizeError)
          }
        }
      }

      // Initial resize
      setTimeout(handleResize, 100)
      window.addEventListener('resize', handleResize)
      
      // Lock chart to prevent any interaction
      setTimeout(() => {
        if (chartRef.current) {
          chartRef.current.applyOptions({
            handleScroll: {
              mouseWheel: false,
              pressedMouseMove: false,
              horzTouchDrag: false,
              vertTouchDrag: false,
            },
            handleScale: {
              axisPressedMouseMove: false,
              mouseWheel: false,
              pinch: false,
            },
          })
        }
      }, 200)
      
      setIsChartReady(true)

    } catch (err) {
      console.error('[MinimalisticLineChart] Initialize error:', err)
      setError(`Chart initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }, [waitForContainer])

  // Update chart data
  const updateChart = useCallback(() => {
    if (!lineSeriesRef.current || chartData.length === 0) {
      return
    }

    try {
      // Sort and validate data
      const sortedData = [...chartData].sort((a, b) => a.time - b.time)
      const uniqueData = []
      const seenTimes = new Set()
      
      for (const item of sortedData) {
        if (!seenTimes.has(item.time) && 
            typeof item.time === 'number' && 
            item.time > 0 &&
            typeof item.value === 'number' &&
            !isNaN(item.value) &&
            item.value > 0) {
          seenTimes.add(item.time)
          uniqueData.push(item)
        }
      }

      if (uniqueData.length === 0) {
        console.warn('[MinimalisticLineChart] No valid data to display')
        return
      }

      // Convert to line data format - LINE CHART ONLY, NO CANDLESTICK
      const lineData: LineData[] = uniqueData.map(item => ({
        time: item.time as Time,
        value: item.value, // This creates a simple line chart
      }))

      // Update line data - this will show as a line, not candlesticks
      console.log('[MinimalisticLineChart] Setting line data:', lineData.length, 'points')
      console.log('[MinimalisticLineChart] Sample data:', lineData.slice(0, 3))
      console.log('[MinimalisticLineChart] Using LineSeries.setData (not CandlestickSeries)')
      lineSeriesRef.current.setData(lineData)
      
      console.log('[MinimalisticLineChart] Line chart data set successfully - should show as LINE, not candlesticks')
      
    } catch (err) {
      console.error('[MinimalisticLineChart] Update error:', err)
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
      } catch (err) {
        console.error('[MinimalisticLineChart] Cleanup error (non-critical):', err)
        chartRef.current = null
        lineSeriesRef.current = null
        setIsChartReady(false)
      }
    }
  }, [])

  // Initialize chart on mount
  useEffect(() => {
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
    const hours = timeframes.find(tf => tf.value === selectedTimeframe)?.hours || 24
    fetchChartData(hours)
  }, [selectedTimeframe, fetchChartData, timeframes])

  // Update chart when data changes
  useEffect(() => {
    if (isChartReady && chartData.length > 0 && lineSeriesRef.current) {
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
      {/* Header - Google Finance Style */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{product.name}</h3>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-gray-900">
                Rp {product.currentPrice.toLocaleString('id-ID')}
              </span>
              <span className={`text-lg flex items-center gap-1 px-3 py-1 rounded-full ${
                priceChange.change >= 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
              }`}>
                {priceChange.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {priceChange.changePercent >= 0 ? '+' : ''}{priceChange.changePercent.toFixed(2)}%
              </span>
              <span className="text-sm text-gray-500">
                {new Date().toLocaleString('id-ID')} • {product.category}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-sm font-medium ${getRiskColor(product.riskLevel)}`}>
                {product.riskLevel}
              </div>
              <div className="text-sm text-gray-600">
                Expected: +{product.expectedReturn}%
              </div>
            </div>
            <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
              📈 Fixed View
            </div>
          </div>
        </div>

        {/* Timeframe Selector - Fixed Position */}
        <div className="flex gap-1 items-center">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.value}
              onClick={() => setSelectedTimeframe(timeframe.value)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTimeframe === timeframe.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-white hover:shadow-sm border border-gray-200'
              } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container - Fixed Layout */}
      <div className="px-6 pb-6">
        <div className="mb-2">
          <div className="text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-lg inline-flex items-center gap-2">
            <span>🔒</span>
            <span>Chart View - Fixed Layout (No Zoom/Scroll)</span>
          </div>
        </div>
        <div 
          ref={chartContainerRef} 
          className="w-full bg-white relative overflow-hidden border border-gray-200 rounded-lg"
          style={{ 
            height: '450px',
            minHeight: '450px',
            maxHeight: '450px',
            pointerEvents: 'none' // Completely disable all interactions
          }}
        >
          {(!isChartReady || loading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">{!isChartReady ? 'Initializing chart...' : 'Loading chart data...'}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Chart Info - Fixed Position */}
        {chartData.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="text-xs text-gray-500 bg-green-50 px-3 py-2 rounded-lg">
              <span className="font-medium">💡 User-Friendly Chart:</span> Chart ini dirancang untuk kemudahan penggunaan. Tidak perlu zoom atau scroll - data ditampilkan dalam tampilan yang optimal untuk semua pengguna.
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-500 text-xs uppercase tracking-wide">Previous Close</span>
                <div className="font-bold text-lg text-gray-900">
                  Rp {chartData[0]?.value?.toLocaleString('id-ID') || '0'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-500 text-xs uppercase tracking-wide">Day Range</span>
                <div className="font-bold text-lg text-gray-900">
                  Rp {Math.min(...chartData.map(d => d.value)).toLocaleString('id-ID')} - Rp {Math.max(...chartData.map(d => d.value)).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-500 text-xs uppercase tracking-wide">Data Points</span>
                <div className="font-bold text-lg text-blue-600">{chartData.length}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-500 text-xs uppercase tracking-wide">Timeframe</span>
                <div className="font-bold text-lg text-purple-600">{selectedTimeframe}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MinimalisticLineChart
