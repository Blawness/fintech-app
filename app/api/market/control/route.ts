import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { marketSimulator } from '@/lib/market-simulator'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admin can control market simulator
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, interval } = body

    switch (action) {
      case 'start':
        const startInterval = interval || 10000 // Default 10 seconds
        marketSimulator.start(startInterval)
        return NextResponse.json({
          message: 'Market simulator started',
          interval: startInterval,
          isRunning: marketSimulator.isSimulationRunning()
        })

      case 'stop':
        marketSimulator.stop()
        return NextResponse.json({
          message: 'Market simulator stopped',
          isRunning: marketSimulator.isSimulationRunning()
        })

      case 'status':
        return NextResponse.json({
          message: 'Market simulator status',
          isRunning: marketSimulator.isSimulationRunning()
        })

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: start, stop, or status' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error controlling market simulator:', error)
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
