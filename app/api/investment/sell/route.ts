import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, units } = body

    if (!productId || !units) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
      include: {
        holdings: {
          where: { productId: productId }
        }
      }
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    const holding = portfolio.holdings[0]
    if (!holding) {
      return NextResponse.json({ error: 'You do not own this product' }, { status: 400 })
    }

    if (units > holding.units) {
      return NextResponse.json({ 
        error: `You can only sell up to ${holding.units.toFixed(4)} units` 
      }, { status: 400 })
    }

    // Get current product price
    const product = await prisma.investmentProduct.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const currentPrice = product.currentPrice
    const totalValue = units * currentPrice
    const gain = (currentPrice - holding.averagePrice) * units
    const gainPercent = ((currentPrice - holding.averagePrice) / holding.averagePrice) * 100

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create sell transaction
      const transaction = await tx.investmentTransaction.create({
        data: {
          userId: session.user.id,
          productId: productId,
          type: 'SELL',
          amount: totalValue,
          units: units,
          price: currentPrice,
          totalValue: totalValue,
          status: 'COMPLETED'
        }
      })

      // Update portfolio balance
      await tx.portfolio.update({
        where: { id: portfolio.id },
        data: {
          rdnBalance: portfolio.rdnBalance + totalValue,
          totalValue: portfolio.totalValue - totalValue,
          totalGain: portfolio.totalGain + gain,
          totalGainPercent: ((portfolio.totalGain + gain) / (portfolio.totalValue - totalValue)) * 100
        }
      })

      if (units === holding.units) {
        // Delete holding if selling all units
        await tx.portfolioHolding.delete({
          where: { id: holding.id }
        })
      } else {
        // Update holding with remaining units
        const remainingUnits = holding.units - units
        const remainingValue = remainingUnits * currentPrice
        const remainingGain = (currentPrice - holding.averagePrice) * remainingUnits
        const remainingGainPercent = ((currentPrice - holding.averagePrice) / holding.averagePrice) * 100

        await tx.portfolioHolding.update({
          where: { id: holding.id },
          data: {
            units: remainingUnits,
            currentValue: remainingValue,
            gain: remainingGain,
            gainPercent: remainingGainPercent
          }
        })
      }

      return transaction
    })

    return NextResponse.json({ 
      message: 'Sell successful',
      transaction: result
    }, { status: 201 })

  } catch (error) {
    console.error('Error selling investment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

