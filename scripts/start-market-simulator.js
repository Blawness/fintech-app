/**
 * Script to start Market Simulator
 * Run with: node scripts/start-market-simulator.js
 */

const { marketSimulator } = require('../lib/market-simulator')

console.log('🚀 Starting Market Simulator...')

// Start market simulator with 10 second interval
marketSimulator.start(10000)

console.log('✅ Market Simulator started successfully!')
console.log('📊 Simulating market every 10 seconds')
console.log('🛑 Press Ctrl+C to stop')

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping Market Simulator...')
  marketSimulator.stop()
  console.log('✅ Market Simulator stopped')
  process.exit(0)
})
