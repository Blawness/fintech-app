/**
 * Script to reset market simulator status
 * Run with: node scripts/reset-market-status.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function resetMarketStatus() {
  try {
    console.log('🔄 Resetting market simulator status...')
    
    // Set database flag to stopped
    await prisma.systemSetting.upsert({
      where: { key: 'market_simulator_running' },
      update: { value: 'stopped' },
      create: { key: 'market_simulator_running', value: 'stopped' }
    })
    
    console.log('✅ Market simulator status reset to stopped')
    
    // Check current status
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'market_simulator_running' }
    })
    
    console.log('📊 Current database flag:', setting?.value || 'not_set')
    
  } catch (error) {
    console.error('❌ Error resetting market status:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetMarketStatus()

