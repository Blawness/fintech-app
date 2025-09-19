'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, LineData, LineSeries, AreaData, AreaSeries, Time } from 'lightweight-charts'
import { TrendingUp, TrendingDown } from 'lucide-react'

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
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D')
  const [isChartReady, setIsChartReady] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>('')

  const timeframes = useMemo(() => ([
    { label: '1D', value: '1D', hours: 24, limit: 24, interval: '1h' }, // 24 data points (1 per hour)
    { label: '5D', value: '5D', hours: 120, limit: 30, interval: '4h' }, // 30 data points (1 per 4 hours)
    { label: '1M', value: '1M', hours: 720, limit: 30, interval: '1d' }, // 30 data points (1 per day)
    { label: '6M', value: '6M', hours: 4320, limit: 30, interval: '6d' }, // 30 data points (1 per 6 days)
    { label: 'YTD', value: 'YTD', hours: 8760, limit: 30, interval: '12d' }, // 30 data points (1 per 12 days)
    { label: '1Y', value: '1Y', hours: 8760, limit: 30, interval: '12d' }, // 30 data points (1 per 12 days)
    { label: '5Y', value: '5Y', hours: 43800, limit: 30, interval: '2m' }, // 30 data points (1 per 2 months)
    { label: 'MAX', value: 'MAX', hours: 87600, limit: 30, interval: '4m' } // 30 data points (1 per 4 months)
  ]), [])

  // Calculate price change and trend
  const priceChange = React.useMemo(() => {
    if (chartData.length < 2) {
      return { change: 0, changePercent: 0, isBullish: true }
    }
    
    const current = chartData[chartData.length - 1].value
    const previous = chartData[chartData.length - 2].value
    const change = current - previous
    const changePercent = (change / previous) * 100
    const isBullish = change >= 0
    
    return { change, changePercent, isBullish }
  }, [chartData])

  // Calculate overall trend for color - more sophisticated calculation
  const overallTrend = React.useMemo(() => {
    if (chartData.length < 2) {
      return { isBullish: true, trendColor: '#22c55e' }
    }
    
    // Calculate trend using multiple methods for better accuracy
    const first = chartData[0].value
    const last = chartData[chartData.length - 1].value
    
    // Method 1: Simple first vs last comparison
    const simpleTrend = last >= first
    
    // Method 2: Calculate average of first 25% vs last 25% of data
    const quarterLength = Math.max(1, Math.floor(chartData.length / 4))
    const firstQuarter = chartData.slice(0, quarterLength)
    const lastQuarter = chartData.slice(-quarterLength)
    
    const firstQuarterAvg = firstQuarter.reduce((sum, item) => sum + item.value, 0) / firstQuarter.length
    const lastQuarterAvg = lastQuarter.reduce((sum, item) => sum + item.value, 0) / lastQuarter.length
    
    const quarterTrend = lastQuarterAvg >= firstQuarterAvg
    
    // Method 3: Linear regression slope
    let slope = 0
    if (chartData.length > 1) {
      const n = chartData.length
      const sumX = chartData.reduce((sum, _, index) => sum + index, 0)
      const sumY = chartData.reduce((sum, item) => sum + item.value, 0)
      const sumXY = chartData.reduce((sum, item, index) => sum + (index * item.value), 0)
      const sumXX = chartData.reduce((sum, _, index) => sum + (index * index), 0)
      
      slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    }
    
    const slopeTrend = slope >= 0
    
    // Combine all methods (majority vote)
    const bullishVotes = [simpleTrend, quarterTrend, slopeTrend].filter(Boolean).length
    const isBullish = bullishVotes >= 2
    
    const trendColor = isBullish ? '#22c55e' : '#ef4444' // Green for bullish, red for bearish
    
    console.log('[MinimalisticLineChart] Trend calculation:', {
      simpleTrend,
      quarterTrend,
      slopeTrend,
      slope,
      isBullish,
      first,
      last,
      firstQuarterAvg,
      lastQuarterAvg
    })
    
    return { isBullish, trendColor }
  }, [chartData])

  // Generate mock data for demo purposes
  const generateMockData = useCallback((hours: number, limit: number) => {
    const now = Math.floor(Date.now() / 1000)
    const startTime = now - (hours * 3600)
    const timeStep = (hours * 3600) / limit
    
    const mockData: ChartData[] = []
    let currentPrice = product.currentPrice
    
    for (let i = 0; i < limit; i++) {
      const time = startTime + (i * timeStep)
      
      // Generate realistic price movement based on risk level
      const volatility = product.riskLevel === 'AGRESIF' ? 0.05 : 
                        product.riskLevel === 'MODERAT' ? 0.03 : 0.02
      
      const randomChange = (Math.random() - 0.5) * volatility
      const trendFactor = product.expectedReturn / 100 / (365 * 24) // Daily expected return
      
      currentPrice = currentPrice * (1 + randomChange + trendFactor)
      
      mockData.push({
        time: time,
        value: Math.max(currentPrice, product.currentPrice * 0.5) // Prevent negative prices
      })
    }
    
    return mockData
  }, [product.currentPrice, product.riskLevel, product.expectedReturn])

  // Fetch chart data
  const fetchChartData = useCallback(async (hours: number, limit: number, interval: string) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log(`[MinimalisticLineChart] Fetching data for ${product.name}, hours: ${hours}, limit: ${limit}, interval: ${interval}`)
      
      // Check if this is a demo product
      if (product.id === 'demo') {
        console.log('[MinimalisticLineChart] Using mock data for demo product')
        const mockData = generateMockData(hours, limit)
        setChartData(mockData)
        return
      }
      
      // Fetch more data than needed to ensure we have enough for sampling
      const response = await fetch(`/api/market/history?productId=${product.id}&hours=${hours}&limit=1000`)
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('[MinimalisticLineChart] Product not found, using mock data')
          const mockData = generateMockData(hours, limit)
          setChartData(mockData)
          return
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'API returned error')
      }
      
      // Convert candlestick data to line data
      const allData: ChartData[] = result.data.chartData.map((item: { time: number; close: number }) => ({
        time: item.time,
        value: item.close
      }))
      
      // Sort data by time
      allData.sort((a, b) => a.time - b.time)
      
      // Sample data based on interval
      const sampledData = sampleDataByInterval(allData, limit)
      
      console.log(`[MinimalisticLineChart] Data received:`, allData.length, 'total points, sampled to:', sampledData.length, 'points')
      setChartData(sampledData)
      
    } catch (err) {
      console.error('[MinimalisticLineChart] Fetch error:', err)
      // Fallback to mock data on error
      console.log('[MinimalisticLineChart] Using mock data as fallback')
      const mockData = generateMockData(hours, limit)
      setChartData(mockData)
    } finally {
      setLoading(false)
    }
  }, [product.id, product.name, generateMockData])

  // Function to sample data by interval
  const sampleDataByInterval = (data: ChartData[], targetCount: number) => {
    if (data.length <= targetCount) {
      return data
    }
    
    const step = Math.ceil(data.length / targetCount)
    const sampled: ChartData[] = []
    
    for (let i = 0; i < data.length; i += step) {
      sampled.push(data[i])
      if (sampled.length >= targetCount) break
    }
    
    // Always include the last data point
    if (sampled.length > 0 && sampled[sampled.length - 1].time !== data[data.length - 1].time) {
      sampled.push(data[data.length - 1])
    }
    
    return sampled
  }

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
          vertLines: { color: '#f0f0f0', visible: true },
          horzLines: { color: '#f0f0f0', visible: true },
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
        },
        timeScale: {
          borderColor: '#cccccc',
          timeVisible: true,
          secondsVisible: false,
          rightOffset: 12,
          barSpacing: 3,
          rightBarStaysOnScroll: true,
          shiftVisibleRangeOnNewBar: true,
          visible: true,
          fixLeftEdge: true, // Fix left edge
          fixRightEdge: true, // Fix right edge
          lockVisibleTimeRangeOnResize: true,
          tickMarkFormatter: (time: number) => {
            const date = new Date(time * 1000)
            return date.toLocaleDateString('id-ID', { 
              month: 'short', 
              day: 'numeric' 
            })
          },
        },
        crosshair: {
          mode: 1, // Enable crosshair for hover tooltip
          vertLine: {
            color: '#666',
            width: 1,
            style: 1,
            labelBackgroundColor: '#f8f9fa',
            labelVisible: true,
          },
          horzLine: {
            color: '#666',
            width: 1,
            style: 1,
            labelBackgroundColor: '#f8f9fa',
            labelVisible: true,
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
        color: '#22c55e', // Default color, will be updated when data loads
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: true, // Enable crosshair markers for hover
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: '#22c55e',
        crosshairMarkerBackgroundColor: '#ffffff',
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      })
      
      console.log('[MinimalisticLineChart] LineSeries created successfully')
      
      // Add area series for gradient fill
      const areaSeries = chart.addSeries(AreaSeries, {
        lineColor: 'rgba(0,0,0,0)', // Hide the area line
        topColor: '#22c55e20', // Default green, will be updated when data loads
        bottomColor: '#22c55e05', // Default green, will be updated when data loads
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      })
      
      console.log('[MinimalisticLineChart] AreaSeries created successfully')
      
      lineSeriesRef.current = lineSeries
      areaSeriesRef.current = areaSeries

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
    if (!lineSeriesRef.current || !areaSeriesRef.current || chartData.length === 0) {
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

      // Convert to area data format for gradient fill
      const areaData: AreaData[] = uniqueData.map(item => ({
        time: item.time as Time,
        value: item.value,
      }))

      // Update line data - this will show as a line, not candlesticks
      console.log('[MinimalisticLineChart] Setting line data:', lineData.length, 'points')
      console.log('[MinimalisticLineChart] Sample data:', lineData.slice(0, 3))
      console.log('[MinimalisticLineChart] Using LineSeries.setData (not CandlestickSeries)')
      lineSeriesRef.current.setData(lineData)
      
      // Update area data for gradient fill
      areaSeriesRef.current.setData(areaData)
      
      // Update colors based on trend
      console.log('[MinimalisticLineChart] Updating colors - Trend:', overallTrend.isBullish ? 'Bullish' : 'Bearish', 'Color:', overallTrend.trendColor)
      
      // Update line series color
      lineSeriesRef.current.applyOptions({
        color: overallTrend.trendColor,
        crosshairMarkerBorderColor: overallTrend.trendColor,
      })
      
      // Update area series colors
      areaSeriesRef.current.applyOptions({
        lineColor: overallTrend.trendColor,
        topColor: overallTrend.isBullish ? '#22c55e20' : '#ef444420',
        bottomColor: overallTrend.isBullish ? '#22c55e05' : '#ef444405',
      })
      
      console.log('[MinimalisticLineChart] Line chart data set successfully - should show as LINE with gradient fill, not candlesticks')
      
    } catch (err) {
      console.error('[MinimalisticLineChart] Update error:', err)
      setError(`Chart update failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }, [chartData, overallTrend.isBullish, overallTrend.trendColor])

  // Cleanup chart
  const cleanupChart = useCallback(() => {
    if (chartRef.current) {
      try {
        chartRef.current.remove()
        chartRef.current = null
        lineSeriesRef.current = null
        areaSeriesRef.current = null
        setIsChartReady(false)
      } catch (err) {
        console.error('[MinimalisticLineChart] Cleanup error (non-critical):', err)
        chartRef.current = null
        lineSeriesRef.current = null
        areaSeriesRef.current = null
        setIsChartReady(false)
      }
    }
  }, [])

  // Set current time on client side only
  useEffect(() => {
    setCurrentTime(new Date().toLocaleString('id-ID'))
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
    const timeframe = timeframes.find(tf => tf.value === selectedTimeframe)
    if (timeframe) {
      fetchChartData(timeframe.hours, timeframe.limit, timeframe.interval)
    }
  }, [selectedTimeframe, fetchChartData, timeframes])

  // Update chart when data changes
  useEffect(() => {
    if (isChartReady && chartData.length > 0 && lineSeriesRef.current && areaSeriesRef.current) {
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
              const timeframe = timeframes.find(tf => tf.value === selectedTimeframe)
              if (timeframe) {
                fetchChartData(timeframe.hours, timeframe.limit, timeframe.interval)
              }
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
                priceChange.isBullish ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
              }`}>
                {priceChange.isBullish ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {priceChange.changePercent >= 0 ? '+' : ''}{priceChange.changePercent.toFixed(2)}%
              </span>
              <span className="text-sm text-gray-500">
                {currentTime || 'Loading...'} • {product.category}
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
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-lg inline-flex items-center gap-2">
            <span>🔒</span>
            <span>Chart View - Fixed Layout (No Zoom/Scroll)</span>
          </div>
          <div className="text-xs text-gray-500">
            Hover untuk melihat detail harga dan waktu
          </div>
        </div>
        <div 
          ref={chartContainerRef} 
          className="w-full bg-white relative overflow-hidden border border-gray-200 rounded-lg shadow-sm"
          style={{ 
            height: '450px',
            minHeight: '450px',
            maxHeight: '450px'
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
            <div className={`text-xs text-gray-500 px-3 py-2 rounded-lg ${
              overallTrend.isBullish ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <span className="font-medium">
                {overallTrend.isBullish ? '📈' : '📉'} {overallTrend.isBullish ? 'Bullish' : 'Bearish'} Trend:
              </span> Chart menampilkan {chartData.length} data points dengan trend {overallTrend.isBullish ? 'naik' : 'turun'} untuk timeframe {selectedTimeframe}. Warna {overallTrend.isBullish ? 'hijau' : 'merah'} menunjukkan arah pergerakan harga.
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
                <div className="text-xs text-gray-500 mt-1">
                  {selectedTimeframe === '1D' && '1 per jam'}
                  {selectedTimeframe === '5D' && '1 per 4 jam'}
                  {selectedTimeframe === '1M' && '1 per hari'}
                  {selectedTimeframe === '6M' && '1 per 6 hari'}
                  {(selectedTimeframe === 'YTD' || selectedTimeframe === '1Y') && '1 per 12 hari'}
                  {selectedTimeframe === '5Y' && '1 per 2 bulan'}
                  {selectedTimeframe === 'MAX' && '1 per 4 bulan'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-500 text-xs uppercase tracking-wide">Timeframe</span>
                <div className="font-bold text-lg text-purple-600">{selectedTimeframe}</div>
                <div className="text-xs text-gray-500 mt-1">Optimized View</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MinimalisticLineChart
