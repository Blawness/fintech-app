import { prisma } from './prisma'

// Market simulation configuration - More realistic volatility
const RISK_VOLATILITY = {
  'KONSERVATIF': 0.001, // 0.1% volatility for conservative products
  'MODERAT': 0.003,     // 0.3% volatility for moderate products  
  'AGRESIF': 0.008      // 0.8% volatility for aggressive products
}

// Product type volatility multipliers
const TYPE_VOLATILITY = {
  'PASAR_UANG': 0.3,    // Money market - very stable
  'OBLIGASI': 0.5,      // Bonds - stable
  'CAMPURAN': 0.8,      // Mixed - moderate volatility
  'SAHAM': 1.2          // Stocks - higher volatility
}

const MARKET_TREND_FACTOR = 0.85 // 85% follow expected return trend
const RANDOM_FACTOR = 0.15 // 15% random movement
const MEAN_REVERSION_FACTOR = 0.1 // 10% mean reversion for conservative products


export class MarketSimulator {
  private static instance: MarketSimulator
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false
  private spare: number | null = null // For Box-Muller transform

  private constructor() {}

  public static getInstance(): MarketSimulator {
    if (!MarketSimulator.instance) {
      MarketSimulator.instance = new MarketSimulator()
    }
    return MarketSimulator.instance
  }

  public start(intervalMs: number = 10000): void {
    if (this.isRunning) {
      console.log('Market simulator is already running')
      return
    }

    // Clear any existing interval first
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    console.log(`Starting market simulator with ${intervalMs}ms interval`)
    this.isRunning = true

    this.intervalId = setInterval(async () => {
      try {
        await this.simulateMarket()
      } catch (error) {
        console.error('Error in market simulation:', error)
        // Don't stop the simulator on individual errors
      }
    }, intervalMs)

    // Run initial simulation
    this.simulateMarket()
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('Market simulator stopped')
  }

  public isSimulationRunning(): boolean {
    return this.isRunning
  }

  private async simulateMarket(): Promise<void> {
    try {
      // Get all active investment products
      const products = await prisma.investmentProduct.findMany({
        where: { isActive: true }
      })

      if (products.length === 0) {
        console.log('No active products found for simulation')
        return
      }

      const updatedProducts = []

      for (const product of products) {
        // Calculate new price based on expected return and risk level
        const newPrice = this.calculateNewPrice(product)
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
      await this.updateAllPortfolioHoldings()

      console.log(`Market simulation completed - Updated ${updatedProducts.length} products at ${new Date().toISOString()}`)

    } catch (error) {
      console.error('Error in market simulation:', error)
    }
  }

  private calculateNewPrice(product: {
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
    // Assuming 10-second intervals, there are 3153600 intervals in a year
    const intervalsPerYear = 3153600
    const trendPerInterval = expectedReturn / intervalsPerYear

    // Generate random factor with normal distribution (more realistic)
    const randomFactor = this.generateNormalRandom() * 2 // Scale to -2 to 2

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
  private generateNormalRandom(): number {
    if (this.spare !== null) {
      const temp = this.spare
      this.spare = null
      return temp
    }
    
    const u1 = Math.random()
    const u2 = Math.random()
    const mag = Math.sqrt(-2 * Math.log(u1))
    this.spare = mag * Math.cos(2 * Math.PI * u2)
    return mag * Math.sin(2 * Math.PI * u2)
  }

  private async updateAllPortfolioHoldings(): Promise<void> {
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
}

// Global market simulator instance
export const marketSimulator = MarketSimulator.getInstance()

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down market simulator...')
  marketSimulator.stop()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('Shutting down market simulator...')
  marketSimulator.stop()
  process.exit(0)
})
