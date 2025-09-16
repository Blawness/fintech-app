import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get current day (you can modify this logic based on your needs)
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    const lessonDay = (dayOfYear % 3) + 1 // Cycle through lessons 1-3

    const lesson = await prisma.lesson.findUnique({
      where: { day: lessonDay },
      include: {
        quiz: true
      }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'No lesson found for today' }, { status: 404 })
    }

    return NextResponse.json(lesson)
  } catch (error) {
    console.error('Error fetching today\'s lesson:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
