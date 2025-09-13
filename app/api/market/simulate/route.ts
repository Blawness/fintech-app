import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Market simulation configuration
const RISK_VOLATILITY = {
  'KONSERVATIF': 0.02, // 2% volatility
  'MODERAT': 0.05,     // 5% volatility  
  'AGRESIF': 0.10      // 10% volatility
}

const MARKET_TREND_FACTOR = 0.7 // 70% follow expected return trend
const RANDOM_FACTOR = 0.3 // 30% random movement

export async function POST(request: NextRequest) {
  try {
    // Get all active investment products
    const products = await prisma.investmentProduct.findMany({
      where: { isActive: true }
    })

    if (products.length === 0) {
      return NextResponse.json({ 
        message: 'No active products found',
        updated: 0 
      })
    }

    const updatedProducts = []

    for (const product of products) {
      // Calculate new price based on expected return and risk level
      const newPrice = calculateNewPrice(product)
      const change = newPrice - product.currentPrice
      const changePercent = (change / product.currentPrice) * 100
      
      // Update product price and save price history
      await prisma.$transaction(async (tx) => {
        // Update product price
        await tx.investmentProduct.update({
          where: { id: product.id },
          data: { 
            currentPrice: newPrice,
            updatedAt: new Date()
          }
        })

        // Save price history
        await tx.priceHistory.create({
          data: {
            productId: product.id,
            price: newPrice,
            change: change,
            changePercent: changePercent
          }
        })
      })

      updatedProducts.push({
        id: product.id,
        name: product.name,
        oldPrice: product.currentPrice,
        newPrice: newPrice,
        change: change,
        changePercent: changePercent
      })
    }

    // Update all portfolio holdings to reflect new prices
    await updateAllPortfolioHoldings()

    return NextResponse.json({
      message: 'Market simulation completed',
      updated: updatedProducts.length,
      products: updatedProducts,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in market simulation:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

function calculateNewPrice(product: any): number {
  const currentPrice = product.currentPrice
  const expectedReturn = product.expectedReturn / 100 // Convert percentage to decimal
  const riskLevel = product.riskLevel as keyof typeof RISK_VOLATILITY
  const volatility = RISK_VOLATILITY[riskLevel] || 0.02

  // Calculate trend based on expected return (annualized to 10-second interval)
  // Assuming 10-second intervals, there are 3153600 intervals in a year
  const intervalsPerYear = 3153600
  const trendPerInterval = expectedReturn / intervalsPerYear

  // Generate random factor (-1 to 1)
  const randomFactor = (Math.random() - 0.5) * 2

  // Calculate price change
  // 70% follows expected return trend, 30% is random
  const trendChange = currentPrice * trendPerInterval * MARKET_TREND_FACTOR
  const randomChange = currentPrice * volatility * randomFactor * RANDOM_FACTOR
  
  const totalChange = trendChange + randomChange
  const newPrice = currentPrice + totalChange

  // Ensure price doesn't go below 1% of original price (prevent negative prices)
  const minPrice = currentPrice * 0.01
  return Math.max(newPrice, minPrice)
}

async function updateAllPortfolioHoldings() {
  try {
    // Get all portfolio holdings
    const holdings = await prisma.portfolioHolding.findMany({
      include: {
        product: true
      }
    })

    // Update each holding with new current values and gains
    for (const holding of holdings) {
      const currentValue = holding.units * holding.product.currentPrice
      const gain = currentValue - (holding.averagePrice * holding.units)
      const gainPercent = (gain / (holding.averagePrice * holding.units)) * 100

      await prisma.portfolioHolding.update({
        where: { id: holding.id },
        data: {
          currentValue,
          gain,
          gainPercent
        }
      })
    }

    // Update all portfolio totals
    const portfolios = await prisma.portfolio.findMany({
      include: {
        holdings: true
      }
    })

    for (const portfolio of portfolios) {
      const totalValue = portfolio.holdings.reduce((sum, holding) => sum + holding.currentValue, 0)
      const totalGain = portfolio.holdings.reduce((sum, holding) => sum + holding.gain, 0)
      const totalGainPercent = totalValue > 0 ? (totalGain / (totalValue - totalGain)) * 100 : 0

      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          totalValue,
          totalGain,
          totalGainPercent
        }
      })
    }

  } catch (error) {
    console.error('Error updating portfolio holdings:', error)
  }
}

// GET endpoint to check market status
export async function GET() {
  try {
    const products = await prisma.investmentProduct.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        currentPrice: true,
        expectedReturn: true,
        riskLevel: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Market status',
      productCount: products.length,
      products: products,
      lastUpdate: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching market status:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
