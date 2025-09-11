import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { userId } = await params

    if (!session?.user?.id || session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const progress = await prisma.userProgress.findMany({
      where: { userId: userId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            day: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    })

    const currentStreak = progress.length > 0 ? progress[0].streak : 0
    const totalLessonsCompleted = progress.length
    const averageScore = progress.length > 0 
      ? Math.round(progress.reduce((sum, p) => sum + (p.quizScore || 0), 0) / progress.length)
      : 0

    return NextResponse.json({
      progress,
      stats: {
        currentStreak,
        totalLessonsCompleted,
        averageScore
      }
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
