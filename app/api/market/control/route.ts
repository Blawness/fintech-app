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
        
        // Set database flag to indicate simulation is running
        await prisma.systemSetting.upsert({
          where: { key: 'market_simulator_running' },
          update: { value: 'true' },
          create: { key: 'market_simulator_running', value: 'true' }
        })
        
        return NextResponse.json({
          message: 'Market simulator started',
          interval: startInterval,
          isRunning: true,
          databaseFlag: 'true'
        })

      case 'stop':
        marketSimulator.stop()
        
        // Set a flag in database to stop external simulation
        await prisma.systemSetting.upsert({
          where: { key: 'market_simulator_running' },
          update: { value: 'stopped' },
          create: { key: 'market_simulator_running', value: 'stopped' }
        })
        
        return NextResponse.json({
          message: 'Market simulator stopped',
          isRunning: false,
          databaseFlag: 'stopped'
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
    
    // More accurate detection: prioritize database flag over activity
    let isActuallyRunning = false
    
    if (runningFlag) {
      // If database flag exists, use it as primary indicator
      isActuallyRunning = runningFlag.value === 'true'
      
      // Only consider recent activity if database flag is 'true'
      if (runningFlag.value === 'true' && timeDiff > 15000) {
        // If flag is true but no recent activity for 15+ seconds, consider it stopped
        isActuallyRunning = false
      }
    } else {
      // If no database flag, check if internal simulator is running
      isActuallyRunning = marketSimulator.isSimulationRunning()
    }
    
    // Don't use activity alone to determine running status
    // Only use activity as a secondary check when flag is 'true'

    // If no simulation is actually running, ensure database flag is set to stopped
    if (!isActuallyRunning && runningFlag && runningFlag.value === 'true') {
      await prisma.systemSetting.update({
        where: { key: 'market_simulator_running' },
        data: { value: 'stopped' }
      })
    }

    return NextResponse.json({
      message: 'Market simulator status',
      isRunning: isActuallyRunning,
      timestamp: lastUpdate?.toISOString() || new Date().toISOString(),
      lastUpdateTime: lastUpdate?.toISOString(),
      timeSinceLastUpdate: timeDiff,
      databaseFlag: runningFlag?.value || 'not_set'
    })

  } catch (error) {
    console.error('Error getting market simulator status:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
