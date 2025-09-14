import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const products = await prisma.investmentProduct.findMany({
      where: {
        isActive: true,
        id: {
          not: 'BALANCE_INJECTION' // Hide balance injection product from regular users
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, category, riskLevel, expectedReturn, minInvestment, currentPrice, description } = body

    const product = await prisma.investmentProduct.create({
      data: {
        name,
        type,
        category,
        riskLevel,
        expectedReturn,
        minInvestment,
        currentPrice,
        description
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
