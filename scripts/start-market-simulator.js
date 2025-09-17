/**
 * Script to start Market Simulator
 * Run with: node scripts/start-market-simulator.js
 */

const { marketSimulator } = require('../lib/market-simulator')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

console.log('🚀 Starting Market Simulator...')

// Start market simulator with 10 second interval
marketSimulator.start(10000)

// Set running flag in database
prisma.systemSetting.upsert({
  where: { key: 'market_simulator_running' },
  update: { value: 'true' },
  create: { key: 'market_simulator_running', value: 'true' }
}).then(() => {
  console.log('✅ Market Simulator started successfully!')
  console.log('📊 Simulating market every 10 seconds')
  console.log('🛑 Press Ctrl+C to stop')
})

// Check stop flag every 5 seconds
const checkStopFlag = setInterval(async () => {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'market_simulator_running' }
    })
    
    if (setting && setting.value === 'false') {
      console.log('🛑 Stop signal received from admin panel...')
      marketSimulator.stop()
      await prisma.systemSetting.update({
        where: { key: 'market_simulator_running' },
        data: { value: 'stopped' }
      })
      clearInterval(checkStopFlag)
      process.exit(0)
    }
  } catch (error) {
    console.error('Error checking stop flag:', error)
  }
}, 5000)

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping Market Simulator...')
  marketSimulator.stop()
  console.log('✅ Market Simulator stopped')
  process.exit(0)
})
