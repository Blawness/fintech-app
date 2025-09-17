/**
 * Script to check database status
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkStatus() {
  try {
    console.log('🔍 Checking database status...')
    
    // Check price history
    const recentHistory = await prisma.priceHistory.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true }
    })
    
    const now = new Date()
    const lastUpdate = recentHistory?.timestamp
    const timeDiff = lastUpdate ? now.getTime() - lastUpdate.getTime() : Infinity
    
    console.log('📊 Last price update:', lastUpdate?.toISOString())
    console.log('⏰ Time diff (ms):', timeDiff)
    console.log('⏰ Time diff (seconds):', Math.round(timeDiff/1000))
    console.log('⏰ Time diff (minutes):', Math.round(timeDiff/60000))
    
    // Check system setting
    const runningFlag = await prisma.systemSetting.findUnique({
      where: { key: 'market_simulator_running' }
    })
    
    console.log('🏃 Database flag:', runningFlag?.value || 'not_set')
    
    // Check if would be considered running
    const isActuallyRunning = timeDiff < 10000 && (!runningFlag || runningFlag.value !== 'false')
    console.log('✅ Would be considered running:', isActuallyRunning)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkStatus()

