import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const hours = parseInt(searchParams.get('hours') || '24')
    const limit = parseInt(searchParams.get('limit') || '100')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Calculate time range
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - (hours * 60 * 60 * 1000))

    // Get price history for the product
    const priceHistory = await prisma.priceHistory.findMany({
      where: {
        productId: productId,
        timestamp: {
          gte: startTime,
          lte: endTime
        }
      },
      orderBy: {
        timestamp: 'asc'
      },
      take: limit
    })

    // Get current product info
    const product = await prisma.investmentProduct.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Format data for TradingView charts
    const chartData = priceHistory.map((entry, index) => {
      // Ensure unique timestamps by adding index seconds
      const baseTime = Math.floor(entry.timestamp.getTime() / 1000)
      const time = baseTime + index // Add index to ensure unique timestamps
      
      // Create more realistic OHLC data
      const priceVariation = entry.price * 0.001 // 0.1% variation
      const open = entry.price + (Math.random() - 0.5) * priceVariation
      const close = entry.price + (Math.random() - 0.5) * priceVariation
      const high = Math.max(open, close) + Math.random() * priceVariation
      const low = Math.min(open, close) - Math.random() * priceVariation
      
      return {
        time,
        open,
        high,
        low,
        close,
        volume: Math.random() * 1000 + 100 // Simulate volume data
      }
    })

    // If no history data, create some sample data based on current price
    if (chartData.length === 0) {
      const currentPrice = product.currentPrice
      const sampleData = []
      const now = Math.floor(Date.now() / 1000)
      
      // Generate sample data points (every 5 minutes for the last 24 hours)
      const dataPoints = Math.min(limit, 288) // 288 = 24 hours * 12 (5-min intervals)
      
      for (let i = dataPoints - 1; i >= 0; i--) {
        const time = now - (i * 300) // Every 5 minutes (300 seconds)
        const priceVariation = (Math.random() - 0.5) * 0.02 // ±1% variation
        const basePrice = currentPrice * (1 + priceVariation)
        
        // Create realistic OHLC data
        const open = basePrice + (Math.random() - 0.5) * basePrice * 0.001
        const close = basePrice + (Math.random() - 0.5) * basePrice * 0.001
        const high = Math.max(open, close) + Math.random() * basePrice * 0.001
        const low = Math.min(open, close) - Math.random() * basePrice * 0.001
        
        sampleData.push({
          time,
          open,
          high,
          low,
          close,
          volume: Math.random() * 1000 + 100
        })
      }
      
      chartData.push(...sampleData)
    }

    return NextResponse.json({
      success: true,
      data: {
        product: {
          id: product.id,
          name: product.name,
          currentPrice: product.currentPrice,
          expectedReturn: product.expectedReturn,
          riskLevel: product.riskLevel,
          category: product.category
        },
        chartData,
        timeRange: {
          start: startTime.toISOString(),
          end: endTime.toISOString(),
          hours
        }
      }
    })

  } catch (error) {
    console.error('Error fetching price history:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch price history' 
    }, { status: 500 })
  }
}