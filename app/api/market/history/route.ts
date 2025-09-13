import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const limit = parseInt(searchParams.get('limit') || '100')
    const hours = parseInt(searchParams.get('hours') || '24')

    // Calculate time range
    const startTime = new Date()
    startTime.setHours(startTime.getHours() - hours)

    let whereClause: any = {
      timestamp: {
        gte: startTime
      }
    }

    if (productId) {
      whereClause.productId = productId
    }

    // Get price history
    const priceHistory = await prisma.priceHistory.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            riskLevel: true,
            expectedReturn: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    })

    // Group by product for easier frontend consumption
    const groupedHistory = priceHistory.reduce((acc, record) => {
      const productId = record.productId
      if (!acc[productId]) {
        acc[productId] = {
          product: record.product,
          history: []
        }
      }
      acc[productId].history.push({
        id: record.id,
        price: record.price,
        change: record.change,
        changePercent: record.changePercent,
        timestamp: record.timestamp
      })
      return acc
    }, {} as any)

    return NextResponse.json({
      message: 'Price history retrieved',
      data: groupedHistory,
      count: priceHistory.length,
      timeRange: {
        start: startTime.toISOString(),
        end: new Date().toISOString(),
        hours: hours
      }
    })

  } catch (error) {
    console.error('Error fetching price history:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
