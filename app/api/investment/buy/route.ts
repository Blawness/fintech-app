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
    const { productId, amount } = body

    if (!productId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get product details
    const product = await prisma.investmentProduct.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (!product.isActive) {
      return NextResponse.json({ error: 'Product is not active' }, { status: 400 })
    }

    if (amount < product.minInvestment) {
      return NextResponse.json({ 
        error: `Minimum investment is Rp ${product.minInvestment.toLocaleString('id-ID')}` 
      }, { status: 400 })
    }

    // Get or create user portfolio
    let portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id }
    })

    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          userId: session.user.id,
          riskProfile: 'KONSERVATIF', // Default risk profile
          rdnBalance: 1000000, // Give user starting balance
          tradingBalance: 0
        }
      })
    }

    // Check if user has enough balance
    if (amount > portfolio.rdnBalance) {
      return NextResponse.json({ 
        error: 'Insufficient balance' 
      }, { status: 400 })
    }

    // Calculate units
    const units = amount / product.currentPrice
    const totalValue = amount

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create investment transaction
      const transaction = await tx.investmentTransaction.create({
        data: {
          userId: session.user.id,
          productId: productId,
          type: 'BUY',
          amount: amount,
          units: units,
          price: product.currentPrice,
          totalValue: totalValue,
          status: 'COMPLETED'
        }
      })

      // Update portfolio balance
      await tx.portfolio.update({
        where: { id: portfolio.id },
        data: {
          rdnBalance: portfolio.rdnBalance - amount,
          totalValue: portfolio.totalValue + totalValue
        }
      })

      // Check if user already has this product
      const existingHolding = await tx.portfolioHolding.findUnique({
        where: {
          portfolioId_productId: {
            portfolioId: portfolio.id,
            productId: productId
          }
        }
      })

      if (existingHolding) {
        // Update existing holding
        const newUnits = existingHolding.units + units
        const newAveragePrice = ((existingHolding.averagePrice * existingHolding.units) + (product.currentPrice * units)) / newUnits
        const newCurrentValue = newUnits * product.currentPrice
        const newGain = newCurrentValue - (newAveragePrice * newUnits)
        const newGainPercent = (newGain / (newAveragePrice * newUnits)) * 100

        await tx.portfolioHolding.update({
          where: { id: existingHolding.id },
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
        await tx.portfolioHolding.create({
          data: {
            portfolioId: portfolio.id,
            productId: productId,
            units: units,
            averagePrice: product.currentPrice,
            currentValue: totalValue,
            gain: 0,
            gainPercent: 0
          }
        })
      }

      return transaction
    })

    return NextResponse.json({ 
      message: 'Investment successful',
      transaction: result
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating investment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
