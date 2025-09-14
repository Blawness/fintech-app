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
    const chartData = priceHistory.map(entry => ({
      time: Math.floor(entry.timestamp.getTime() / 1000), // Convert to Unix timestamp
      open: entry.price,
      high: entry.price * 1.001, // Simulate OHLC data
      low: entry.price * 0.999,
      close: entry.price,
      volume: Math.random() * 1000 // Simulate volume data
    }))

    // If no history data, create some sample data based on current price
    if (chartData.length === 0) {
      const currentPrice = product.currentPrice
      const sampleData = []
      const now = Math.floor(Date.now() / 1000)
      
      // Generate 24 hours of sample data
      for (let i = 23; i >= 0; i--) {
        const time = now - (i * 3600) // Every hour
        const priceVariation = (Math.random() - 0.5) * 0.02 // ±1% variation
        const price = currentPrice * (1 + priceVariation)
        
        sampleData.push({
          time,
          open: price,
          high: price * 1.001,
          low: price * 0.999,
          close: price,
          volume: Math.random() * 1000
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