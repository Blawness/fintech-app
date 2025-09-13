import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, amount } = body

    if (!userId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    if (amount > 100000000) { // Max 100 juta
      return NextResponse.json({ error: 'Maximum injection amount is Rp 100,000,000' }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get or create user portfolio
    let portfolio = await prisma.portfolio.findUnique({
      where: { userId: userId }
    })

    if (!portfolio) {
      // Create portfolio if doesn't exist
      portfolio = await prisma.portfolio.create({
        data: {
          userId: userId,
          riskProfile: 'KONSERVATIF',
          rdnBalance: amount,
          tradingBalance: 0
        }
      })
    } else {
      // Update existing portfolio
      portfolio = await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          rdnBalance: portfolio.rdnBalance + amount
        }
      })
    }

    // Create balance injection transaction record
    // First, create or get a special balance injection product
    const balanceProduct = await prisma.investmentProduct.upsert({
      where: { id: 'BALANCE_INJECTION' },
      update: {},
      create: {
        id: 'BALANCE_INJECTION',
        name: 'Balance Injection',
        type: 'BALANCE',
        category: 'BALANCE',
        riskLevel: 'KONSERVATIF',
        expectedReturn: 0,
        minInvestment: 0,
        currentPrice: 1,
        description: 'Special product for balance injection by admin',
        isActive: true
      }
    })

    await prisma.investmentTransaction.create({
      data: {
        userId: userId,
        productId: balanceProduct.id,
        type: 'BUY',
        amount: amount,
        units: 0, // No units for balance injection
        price: 1, // 1:1 ratio for balance
        totalValue: amount,
        status: 'COMPLETED'
      }
    })

    return NextResponse.json({ 
      message: 'Balance injection successful',
      newBalance: portfolio.rdnBalance
    }, { status: 200 })

  } catch (error) {
    console.error('Error injecting balance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
