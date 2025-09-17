import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { marketSimulator } from '@/lib/market-simulator'
import { prisma } from '@/lib/prisma'

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
        
        // Set a flag in database to stop external simulation
        await prisma.systemSetting.upsert({
          where: { key: 'market_simulator_running' },
          update: { value: 'false' },
          create: { key: 'market_simulator_running', value: 'false' }
        })
        
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

    // Check if simulation is running by looking at recent price history and database flag
    const recentHistory = await prisma.priceHistory.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true }
    })

    // Check database flag
    const runningFlag = await prisma.systemSetting.findUnique({
      where: { key: 'market_simulator_running' }
    })

    const now = new Date()
    const lastUpdate = recentHistory?.timestamp
    const timeDiff = lastUpdate ? now.getTime() - lastUpdate.getTime() : Infinity
    
    // If last update was within 15 seconds OR database flag is true, consider it running
    const isActuallyRunning = timeDiff < 15000 || 
                             marketSimulator.isSimulationRunning() || 
                             (runningFlag && runningFlag.value === 'true')

    return NextResponse.json({
      message: 'Market simulator status',
      isRunning: isActuallyRunning,
      timestamp: lastUpdate?.toISOString() || new Date().toISOString(),
      lastUpdateTime: lastUpdate?.toISOString(),
      timeSinceLastUpdate: timeDiff
    })

  } catch (error) {
    console.error('Error getting market simulator status:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
