import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    // Get or create portfolio
    let portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        holdings: {
          include: {
            product: true
          }
        }
      }
    })

    if (!portfolio) {
      // Create portfolio if it doesn't exist
      portfolio = await prisma.portfolio.create({
        data: {
          userId,
          riskProfile: 'KONSERVATIF',
          rdnBalance: 1000000, // Default RDN balance
          tradingBalance: 0
        },
        include: {
          holdings: {
            include: {
              product: true
            }
          }
        }
      })
    }

    // Calculate current values without updating database
    const updatedHoldings = portfolio.holdings.map(holding => {
      const currentValue = holding.units * holding.product.currentPrice
      const gain = currentValue - (holding.averagePrice * holding.units)
      const gainPercent = (gain / (holding.averagePrice * holding.units)) * 100

      return {
        ...holding,
        currentValue,
        gain,
        gainPercent
      }
    })

    // Calculate total portfolio value and gains
    const totalValue = updatedHoldings.reduce((sum, holding) => sum + holding.currentValue, 0)
    const totalGain = updatedHoldings.reduce((sum, holding) => sum + holding.gain, 0)
    const totalGainPercent = totalValue > 0 ? (totalGain / (totalValue - totalGain)) * 100 : 0

    // Calculate asset allocation
    const assetAllocation = {
      moneyMarket: 0,
      bonds: 0,
      stocks: 0,
      mixed: 0,
      cash: totalValue > 0 ? 100 : 100
    }

    if (totalValue > 0) {
      updatedHoldings.forEach(holding => {
        const percentage = (holding.currentValue / totalValue) * 100
        switch (holding.product.category) {
          case 'PASAR_UANG':
            assetAllocation.moneyMarket += percentage
            break
          case 'OBLIGASI':
            assetAllocation.bonds += percentage
            break
          case 'SAHAM':
            assetAllocation.stocks += percentage
            break
          case 'CAMPURAN':
            assetAllocation.mixed += percentage
            break
        }
      })
      
      // Adjust cash percentage
      const investedPercentage = assetAllocation.moneyMarket + assetAllocation.bonds + 
                                assetAllocation.stocks + assetAllocation.mixed
      assetAllocation.cash = Math.max(0, 100 - investedPercentage)
    }

    return NextResponse.json({
      ...portfolio,
      totalValue,
      totalGain,
      totalGainPercent,
      assetAllocation,
      monthlyStreak: 0,
      holdings: updatedHoldings
    })
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch portfolio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
