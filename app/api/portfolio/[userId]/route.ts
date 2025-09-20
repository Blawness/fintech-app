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
      // Check if user exists first
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        // Create a test user if it doesn't exist
        await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@test.com`,
            name: `Test User ${userId}`,
            role: 'USER',
            passwordHash: 'dummy_hash_for_test_user'
          }
        })
      }

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
        switch (holding.product.type) {
          case 'REKSADANA':
            assetAllocation.mixed += percentage
            break
          case 'OBLIGASI':
            assetAllocation.bonds += percentage
            break
          case 'SBN':
            assetAllocation.bonds += percentage
            break
          case 'CRYPTO':
            assetAllocation.stocks += percentage
            break
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
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const body = await request.json()
    const { riskProfile, rdnBalance, tradingBalance } = body

    const portfolio = await prisma.portfolio.update({
      where: { userId },
      data: {
        riskProfile,
        rdnBalance,
        tradingBalance
      }
    })

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error('Error updating portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to update portfolio' },
      { status: 500 }
    )
  }
}
