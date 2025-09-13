import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { marketSimulator } from '@/lib/market-simulator'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admin can start market simulator
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { interval = 10000 } = body

    // Start market simulator
    marketSimulator.start(interval)

    return NextResponse.json({
      message: 'Market simulator started successfully',
      interval: interval,
      isRunning: marketSimulator.isSimulationRunning(),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error starting market simulator:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      message: 'Market simulator status',
      isRunning: marketSimulator.isSimulationRunning(),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error getting market simulator status:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
