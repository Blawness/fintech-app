import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Market simulation configuration - More visible volatility for demo
const RISK_VOLATILITY = {
  'KONSERVATIF': 0.01, // 1% volatility for conservative products
  'MODERAT': 0.03,     // 3% volatility for moderate products  
  'AGRESIF': 0.08      // 8% volatility for aggressive products
}

// Product type volatility multipliers
const TYPE_VOLATILITY = {
  'PASAR_UANG': 0.3,    // Money market - very stable
  'OBLIGASI': 0.5,      // Bonds - stable
  'CAMPURAN': 0.8,      // Mixed - moderate volatility
  'SAHAM': 1.2          // Stocks - higher volatility
}

const MARKET_TREND_FACTOR = 0.5 // 50% follow expected return trend
const RANDOM_FACTOR = 0.5 // 50% random movement
const MEAN_REVERSION_FACTOR = 0.1 // 10% mean reversion for conservative products

export async function POST() {
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

function calculateNewPrice(product: {
  currentPrice: number;
  expectedReturn: number;
  riskLevel: string;
  category: string;
}): number {
  const currentPrice = product.currentPrice
  const expectedReturn = product.expectedReturn / 100 // Convert percentage to decimal
  const riskLevel = product.riskLevel as keyof typeof RISK_VOLATILITY
  const category = product.category as keyof typeof TYPE_VOLATILITY
  
  // Base volatility from risk level
  const baseVolatility = RISK_VOLATILITY[riskLevel] || 0.001
  
  // Apply category multiplier
  const typeMultiplier = TYPE_VOLATILITY[category] || 1.0
  const adjustedVolatility = baseVolatility * typeMultiplier

  // Calculate trend based on expected return (annualized to interval)
  // For demo purposes, let's make changes more visible
  // Assuming we run simulation every 5 seconds, that's 12 times per minute = 630720 times per year
  const intervalsPerYear = 630720 // 5-second intervals
  const trendPerInterval = expectedReturn / intervalsPerYear

  // Generate random factor with normal distribution (more realistic)
  const randomFactor = generateNormalRandom() * 2 // Scale to -2 to 2

  // Calculate price change components
  const trendChange = currentPrice * trendPerInterval * MARKET_TREND_FACTOR
  const randomChange = currentPrice * adjustedVolatility * randomFactor * RANDOM_FACTOR
  
  // Mean reversion for conservative products (tend to return to expected performance)
  let meanReversionChange = 0
  if (riskLevel === 'KONSERVATIF') {
    // Calculate how far we are from expected performance
    const expectedPrice = currentPrice * (1 + expectedReturn / 100) // What price should be after 1 year
    const deviationFromExpected = (currentPrice - expectedPrice) / expectedPrice
    meanReversionChange = -currentPrice * deviationFromExpected * MEAN_REVERSION_FACTOR
  }
  
  const totalChange = trendChange + randomChange + meanReversionChange
  const newPrice = currentPrice + totalChange

  // Ensure price doesn't go below 5% of original price (more realistic floor)
  const minPrice = currentPrice * 0.05
  return Math.max(newPrice, minPrice)
}

// Generate normally distributed random number using Box-Muller transform
let spare: number | null = null
function generateNormalRandom(): number {
  if (spare !== null) {
    const temp = spare
    spare = null
    return temp
  }
  
  const u1 = Math.random()
  const u2 = Math.random()
  const mag = Math.sqrt(-2 * Math.log(u1))
  spare = mag * Math.cos(2 * Math.PI * u2)
  return mag * Math.sin(2 * Math.PI * u2)
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
