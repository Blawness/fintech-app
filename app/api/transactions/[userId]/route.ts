import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'order' or 'history'
    const status = searchParams.get('status') // 'PENDING', 'COMPLETED', 'CANCELLED'

    const whereClause: { 
      userId: string; 
      type?: string;
      status?: string | { in: string[] };
    } = { userId }
    
    if (type === 'order') {
      whereClause.status = 'PENDING'
    } else if (type === 'history') {
      whereClause.status = { in: ['COMPLETED', 'CANCELLED'] }
    }

    if (status) {
      whereClause.status = status
    }

    const transactions = await prisma.investmentTransaction.findMany({
      where: whereClause,
      include: {
        product: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const body = await request.json()
    const { productId, type, amount, units, price } = body

    // Calculate total value
    const totalValue = amount * units

    // Create transaction
    const transaction = await prisma.investmentTransaction.create({
      data: {
        userId,
        productId,
        type,
        amount,
        units,
        price,
        totalValue,
        status: 'PENDING'
      },
      include: {
        product: true
      }
    })

    // If it's a BUY transaction, update portfolio
    if (type === 'BUY') {
      await updatePortfolioAfterBuy(userId, productId, units, price, totalValue)
    }

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}

async function updatePortfolioAfterBuy(
  userId: string,
  productId: string,
  units: number,
  price: number,
  totalValue: number
) {
  // Get or create portfolio
  let portfolio = await prisma.portfolio.findUnique({
    where: { userId }
  })

  if (!portfolio) {
    portfolio = await prisma.portfolio.create({
      data: {
        userId,
        riskProfile: 'KONSERVATIF',
        rdnBalance: 1000000,
        tradingBalance: 0
      }
    })
  }

  // Check if holding already exists
  const existingHolding = await prisma.portfolioHolding.findUnique({
    where: {
      portfolioId_productId: {
        portfolioId: portfolio.id,
        productId
      }
    }
  })

  if (existingHolding) {
    // Update existing holding
    const newUnits = existingHolding.units + units
    const newAveragePrice = ((existingHolding.averagePrice * existingHolding.units) + (price * units)) / newUnits
    const newCurrentValue = newUnits * price
    const newGain = newCurrentValue - (newAveragePrice * newUnits)
    const newGainPercent = (newGain / (newAveragePrice * newUnits)) * 100

    await prisma.portfolioHolding.update({
      where: {
        portfolioId_productId: {
          portfolioId: portfolio.id,
          productId
        }
      },
      data: {
        units: newUnits,
        averagePrice: newAveragePrice,
        currentValue: newCurrentValue,
        gain: newGain,
        gainPercent: newGainPercent
      }
    })
  } else {
    // Create new holding
    await prisma.portfolioHolding.create({
      data: {
        portfolioId: portfolio.id,
        productId,
        units,
        averagePrice: price,
        currentValue: totalValue,
        gain: 0,
        gainPercent: 0
      }
    })
  }

  // Update portfolio totals
  const holdings = await prisma.portfolioHolding.findMany({
    where: { portfolioId: portfolio.id }
  })

  const portfolioTotalValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0)
  const portfolioTotalGain = holdings.reduce((sum, holding) => sum + holding.gain, 0)
  const portfolioTotalGainPercent = portfolioTotalValue > 0 ? (portfolioTotalGain / portfolioTotalValue) * 100 : 0

  await prisma.portfolio.update({
    where: { userId },
    data: {
      totalValue: portfolioTotalValue,
      totalGain: portfolioTotalGain,
      totalGainPercent: portfolioTotalGainPercent
    }
  })
}
