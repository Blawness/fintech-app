/**
 * Script to cleanup old price history data
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupOldData() {
  try {
    console.log('🧹 Cleaning up old price history data...')
    
    // Delete price history older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    const result = await prisma.priceHistory.deleteMany({
      where: {
        timestamp: {
          lt: oneHourAgo
        }
      }
    })
    
    console.log(`✅ Deleted ${result.count} old price history records`)
    
    // Check current status
    const recentHistory = await prisma.priceHistory.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true }
    })
    
    const now = new Date()
    const lastUpdate = recentHistory?.timestamp
    const timeDiff = lastUpdate ? now.getTime() - lastUpdate.getTime() : Infinity
    
    console.log('📊 Last price update after cleanup:', lastUpdate?.toISOString())
    console.log('⏰ Time diff (seconds):', Math.round(timeDiff/1000))
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupOldData()

