import { prisma } from '@/lib/prisma'

// Utility function for consistent rounding
export const roundToDecimals = (value: number, decimals: number = 4): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

// Recalculate and update portfolio totals based on current holdings
export async function recalculatePortfolioTotals(portfolioId: string) {
  // Get all holdings for this portfolio with current product prices
  const holdings = await prisma.portfolioHolding.findMany({
    where: { portfolioId },
    include: { product: true }
  })

  // Calculate totals
  const totalValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0)
  const totalGain = holdings.reduce((sum, holding) => sum + holding.gain, 0)
  const totalGainPercent = totalValue > 0 ? roundToDecimals((totalGain / totalValue) * 100, 2) : 0

  // Update portfolio
  return await prisma.portfolio.update({
    where: { id: portfolioId },
    data: {
      totalValue: roundToDecimals(totalValue, 2),
      totalGain: roundToDecimals(totalGain, 2),
      totalGainPercent
    }
  })
}
