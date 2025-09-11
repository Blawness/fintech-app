import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      include: {
        product: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(watchlist)
  } catch (error) {
    console.error('Error fetching watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const body = await request.json()
    const { productId } = body

    // Check if already in watchlist
    const existingWatchlist = await prisma.watchlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    })

    if (existingWatchlist) {
      return NextResponse.json(
        { error: 'Product already in watchlist' },
        { status: 400 }
      )
    }

    const watchlistItem = await prisma.watchlist.create({
      data: {
        userId,
        productId
      },
      include: {
        product: true
      }
    })

    return NextResponse.json(watchlistItem, { status: 201 })
  } catch (error) {
    console.error('Error adding to watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to add to watchlist' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    await prisma.watchlist.deleteMany({
      where: {
        userId,
        productId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to remove from watchlist' },
      { status: 500 }
    )
  }
}
