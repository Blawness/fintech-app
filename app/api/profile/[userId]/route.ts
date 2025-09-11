import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        portfolio: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const profile = {
      name: user.name,
      email: user.email,
      riskProfile: user.riskProfile || 'KONSERVATIF',
      rdnBalance: user.portfolio?.rdnBalance || 1000000,
      tradingBalance: user.portfolio?.tradingBalance || 0
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
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
    const { name, riskProfile } = body

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        riskProfile
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
