/**
 * Measure API Calls Per Minute in Real-Time
 * Run with: node scripts/measure-calls-per-minute.js
 */

const BASE_URL = 'http://localhost:3000'

class APICallMonitor {
  constructor() {
    this.calls = []
    this.startTime = Date.now()
    this.isRunning = false
  }

  start() {
    console.log('📊 Starting API Call Monitor...')
    console.log('Monitoring calls per minute in real-time\n')
    
    this.isRunning = true
    this.monitor()
    
    // Show stats every 30 seconds
    setInterval(() => {
      this.showStats()
    }, 30000)
  }

  async monitor() {
    if (!this.isRunning) return

    const start = Date.now()
    try {
      // Test both APIs
      const [portfolioResponse, productsResponse] = await Promise.all([
        fetch(`${BASE_URL}/api/portfolio/cmff83cqw00007k7oi469g5r8`),
        fetch(`${BASE_URL}/api/products`)
      ])

      const duration = Date.now() - start
      
      this.calls.push({
        timestamp: Date.now(),
        portfolio: {
          status: portfolioResponse.status,
          duration: duration,
          success: portfolioResponse.ok
        },
        products: {
          status: productsResponse.status,
          duration: duration,
          success: productsResponse.ok
        }
      })

      // Keep only last 5 minutes of data
      const fiveMinutesAgo = Date.now() - 300000
      this.calls = this.calls.filter(call => call.timestamp > fiveMinutesAgo)

    } catch (error) {
      console.error('Monitor error:', error.message)
    }

    // Continue monitoring every 2 seconds
    setTimeout(() => this.monitor(), 2000)
  }

  showStats() {
    const now = Date.now()
    const oneMinuteAgo = now - 60000
    const twoMinutesAgo = now - 120000
    
    // Get calls from last minute
    const lastMinuteCalls = this.calls.filter(call => call.timestamp > oneMinuteAgo)
    const lastTwoMinutesCalls = this.calls.filter(call => call.timestamp > twoMinutesAgo)
    
    // Calculate stats
    const portfolioCalls = lastMinuteCalls.length
    const productsCalls = lastMinuteCalls.length
    const totalCalls = portfolioCalls + productsCalls
    
    const avgResponseTime = lastMinuteCalls.length > 0 
      ? (lastMinuteCalls.reduce((sum, call) => sum + call.portfolio.duration, 0) / lastMinuteCalls.length).toFixed(0)
      : 0

    const successRate = lastMinuteCalls.length > 0
      ? ((lastMinuteCalls.filter(call => call.portfolio.success && call.products.success).length / lastMinuteCalls.length) * 100).toFixed(1)
      : 0

    // Calculate calls per hour projection
    const callsPerHour = totalCalls * 60

    console.log(`\n📈 [${new Date().toLocaleTimeString()}] API Call Statistics:`)
    console.log(`   Last Minute: ${totalCalls} calls (${portfolioCalls} portfolio + ${productsCalls} products)`)
    console.log(`   Projected per Hour: ${callsPerHour} calls`)
    console.log(`   Avg Response Time: ${avgResponseTime}ms`)
    console.log(`   Success Rate: ${successRate}%`)
    
    // Show efficiency rating
    if (callsPerHour > 10000) {
      console.log(`   🚨 CRITICAL: ${callsPerHour} calls/hour - Very inefficient!`)
    } else if (callsPerHour > 5000) {
      console.log(`   ⚠️  WARNING: ${callsPerHour} calls/hour - Too many calls`)
    } else if (callsPerHour > 2000) {
      console.log(`   ⚡ MODERATE: ${callsPerHour} calls/hour - Could be better`)
    } else if (callsPerHour > 1000) {
      console.log(`   ✅ GOOD: ${callsPerHour} calls/hour - Reasonable`)
    } else {
      console.log(`   🎯 EXCELLENT: ${callsPerHour} calls/hour - Very efficient!`)
    }

    // Show recent call pattern
    if (lastMinuteCalls.length > 0) {
      const recentCalls = lastMinuteCalls.slice(-5)
      console.log(`   Recent calls: ${recentCalls.map(call => 
        `P:${call.portfolio.status}(${call.portfolio.duration}ms)`
      ).join(', ')}`)
    }
  }

  stop() {
    this.isRunning = false
    console.log('\n🛑 API Call Monitor stopped')
  }
}

// Start monitoring
const monitor = new APICallMonitor()
monitor.start()

// Handle graceful shutdown
process.on('SIGINT', () => {
  monitor.stop()
  process.exit(0)
})

console.log('Press Ctrl+C to stop monitoring')
