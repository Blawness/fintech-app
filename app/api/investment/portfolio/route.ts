import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user portfolio with holdings
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
      include: {
        holdings: {
          include: {
            product: true
          }
        }
      }
    })

    if (!portfolio) {
      // Create portfolio if doesn't exist
      const newPortfolio = await prisma.portfolio.create({
        data: {
          userId: session.user.id,
          riskProfile: 'KONSERVATIF',
          rdnBalance: 1000000, // Starting balance
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
      return NextResponse.json(newPortfolio)
    }

    // Update current values and gains for all holdings
    const updatedHoldings = await Promise.all(
      portfolio.holdings.map(async (holding) => {
        const currentValue = holding.units * holding.product.currentPrice
        const gain = currentValue - (holding.averagePrice * holding.units)
        const gainPercent = (gain / (holding.averagePrice * holding.units)) * 100

        // Update holding in database
        await prisma.portfolioHolding.update({
          where: { id: holding.id },
          data: {
            currentValue,
            gain,
            gainPercent
          }
        })

        return {
          ...holding,
          currentValue,
          gain,
          gainPercent
        }
      })
    )

    // Calculate total portfolio value and gains
    const totalValue = updatedHoldings.reduce((sum, holding) => sum + holding.currentValue, 0)
    const totalGain = updatedHoldings.reduce((sum, holding) => sum + holding.gain, 0)
    const totalGainPercent = totalValue > 0 ? (totalGain / (totalValue - totalGain)) * 100 : 0

    // Update portfolio totals
    const updatedPortfolio = await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        totalValue,
        totalGain,
        totalGainPercent
      },
      include: {
        holdings: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json(updatedPortfolio)

  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
