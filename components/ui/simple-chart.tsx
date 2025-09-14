'use client'

import { useEffect, useRef, useState } from 'react'

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

interface SimpleChartProps {
  product: Product
  className?: string
}

export function SimpleChart({ product, className = '' }: SimpleChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChartData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching chart data for product:', product.id)
      
      const response = await fetch(`/api/market/history?productId=${product.id}&hours=24&limit=100`)
      const data = await response.json()
      
      console.log('Chart data response:', data)
      
      if (data.success) {
        console.log('Chart data received:', data.data.chartData.length, 'points')
        setChartData(data.data.chartData)
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

  const drawChart = () => {
    const canvas = canvasRef.current
    if (!canvas || chartData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const padding = 40

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Set background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // Draw grid
    ctx.strokeStyle = '#f0f0f0'
    ctx.lineWidth = 1

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i * (width - 2 * padding) / 10)
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
    }

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * (height - 2 * padding) / 5)
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Calculate price range
    const prices = chartData.map(d => [d.high, d.low]).flat()
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice

    // Draw price line
    ctx.strokeStyle = '#26a69a'
    ctx.lineWidth = 2
    ctx.beginPath()

    chartData.forEach((point, index) => {
      const x = padding + (index * (width - 2 * padding) / (chartData.length - 1))
      const y = height - padding - ((point.close - minPrice) / priceRange) * (height - 2 * padding)
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw data points
    ctx.fillStyle = '#26a69a'
    chartData.forEach((point, index) => {
      const x = padding + (index * (width - 2 * padding) / (chartData.length - 1))
      const y = height - padding - ((point.close - minPrice) / priceRange) * (height - 2 * padding)
      
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Draw labels
    ctx.fillStyle = '#333333'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    
    // Price labels
    ctx.textAlign = 'right'
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (i * priceRange / 5)
      const y = height - padding - (i * (height - 2 * padding) / 5)
      ctx.fillText(`Rp ${price.toLocaleString('id-ID')}`, padding - 10, y + 4)
    }

    // Time labels
    ctx.textAlign = 'center'
    for (let i = 0; i < Math.min(5, chartData.length); i++) {
      const index = Math.floor(i * (chartData.length - 1) / 4)
      const x = padding + (index * (width - 2 * padding) / (chartData.length - 1))
      const time = new Date(chartData[index].time * 1000)
      ctx.fillText(time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), x, height - 10)
    }

    console.log('Chart drawn successfully')
  }

  useEffect(() => {
    fetchChartData()
  }, [product.id])

  useEffect(() => {
    if (chartData.length > 0) {
      drawChart()
    }
  }, [chartData])

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
      <div className="p-4 border-b">
        <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
        <p className="text-sm text-gray-600">Simple Chart View</p>
      </div>
      
      <div className="p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full border border-gray-200 rounded"
        />
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Data Points: {chartData.length}</p>
          <p>Current Price: Rp {product.currentPrice.toLocaleString('id-ID')}</p>
        </div>
      </div>
    </div>
  )
}
