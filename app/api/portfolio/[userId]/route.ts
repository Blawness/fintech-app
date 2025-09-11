import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

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

    // Calculate asset allocation
    const totalValue = portfolio.totalValue
    const assetAllocation = {
      moneyMarket: 0,
      bonds: 0,
      stocks: 0,
      mixed: 0,
      cash: totalValue > 0 ? 100 : 100
    }

    if (totalValue > 0) {
      portfolio.holdings.forEach(holding => {
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
      portfolio: {
        ...portfolio,
        assetAllocation,
        monthlyStreak: 0 // This would be calculated based on user activity
      },
      holdings: portfolio.holdings
    })
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
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
