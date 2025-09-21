import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { roundToDecimals, recalculatePortfolioTotals } from '@/lib/portfolio-utils'

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

    // Round units to 4 decimal places for consistency
    const roundedUnits = roundToDecimals(units, 4)

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

    // Use a small tolerance for floating-point comparison
    const tolerance = 0.0001
    if (roundedUnits > (holding.units + tolerance)) {
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

    const currentPrice = roundToDecimals(product.currentPrice, 2)
    const totalValue = roundToDecimals(roundedUnits * currentPrice, 2)
    const gain = roundToDecimals((currentPrice - holding.averagePrice) * roundedUnits, 2)
    // const gainPercent = roundToDecimals(((currentPrice - holding.averagePrice) / holding.averagePrice) * 100, 2)

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create sell transaction
      const transaction = await tx.investmentTransaction.create({
        data: {
          userId: session.user.id,
          productId: productId,
          type: 'SELL',
          amount: totalValue,
          units: roundedUnits,
          price: currentPrice,
          totalValue: totalValue,
          status: 'COMPLETED'
        }
      })

      // Update portfolio balance (only RDN balance, totals will be recalculated)
      await tx.portfolio.update({
        where: { id: portfolio.id },
        data: {
          rdnBalance: portfolio.rdnBalance + totalValue
        }
      })

      // Check if selling all units (with tolerance for floating-point precision)
      const isSellingAll = roundedUnits >= (holding.units - tolerance)
      
      if (isSellingAll) {
        // Delete holding if selling all units
        await tx.portfolioHolding.delete({
          where: { id: holding.id }
        })
      } else {
        // Update holding with remaining units
        const remainingUnits = roundToDecimals(holding.units - roundedUnits, 4)
        const remainingValue = roundToDecimals(remainingUnits * currentPrice, 2)
        const remainingGain = roundToDecimals((currentPrice - holding.averagePrice) * remainingUnits, 2)
        const remainingGainPercent = roundToDecimals(((currentPrice - holding.averagePrice) / holding.averagePrice) * 100, 2)

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

    // Recalculate portfolio totals after the transaction
    await recalculatePortfolioTotals(portfolio.id)

    return NextResponse.json({ 
      message: 'Sell successful',
      transaction: result
    }, { status: 201 })

  } catch (error) {
    console.error('Error selling investment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


