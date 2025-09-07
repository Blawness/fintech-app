import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lessonId, quizScore } = await request.json()

    if (!lessonId || quizScore === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user's current streak
    const lastProgress = await prisma.userProgress.findFirst({
      where: { userId: session.user.id },
      orderBy: { completedAt: 'desc' }
    })

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let newStreak = 1
    if (lastProgress) {
      const lastCompleted = new Date(lastProgress.completedAt)
      if (lastCompleted.toDateString() === yesterday.toDateString()) {
        newStreak = lastProgress.streak + 1
      } else if (lastCompleted.toDateString() !== today.toDateString()) {
        newStreak = 1
      } else {
        newStreak = lastProgress.streak
      }
    }

    // Save or update progress
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId
        }
      },
      update: {
        quizScore,
        streak: newStreak,
        completedAt: new Date()
      },
      create: {
        userId: session.user.id,
        lessonId,
        quizScore,
        streak: newStreak
      }
    })

    return NextResponse.json({ success: true, progress })
  } catch (error) {
    console.error('Error saving progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
