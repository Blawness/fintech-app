/**
 * Measure API Performance and Efficiency
 * Run with: node scripts/measure-api-performance.js
 */

const BASE_URL = 'http://localhost:3000'

async function measureAPIPerformance() {
  console.log('📊 Measuring API Performance...\n')

  const measurements = {
    portfolio: [],
    products: [],
    totalCalls: 0,
    totalTime: 0,
    cacheHits: 0,
    errors: 0
  }

  const testDuration = 60000 // 1 minute test
  const testInterval = 5000 // 5 seconds
  const startTime = Date.now()

  console.log(`Running performance test for ${testDuration/1000} seconds...`)
  console.log(`API calls every ${testInterval/1000} seconds\n`)

  const testAPICall = async (endpoint, name) => {
    const start = Date.now()
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`)
      const duration = Date.now() - start
      
      measurements.totalCalls++
      measurements.totalTime += duration
      
      if (response.status === 304) {
        measurements.cacheHits++
        console.log(`✅ ${name}: 304 Not Modified (${duration}ms) - CACHE HIT`)
      } else if (response.ok) {
        console.log(`✅ ${name}: 200 OK (${duration}ms)`)
      } else {
        measurements.errors++
        console.log(`❌ ${name}: ${response.status} (${duration}ms)`)
      }
      
      return { success: response.ok, duration, status: response.status }
    } catch (error) {
      measurements.errors++
      const duration = Date.now() - start
      console.log(`❌ ${name}: Error (${duration}ms) - ${error.message}`)
      return { success: false, duration, error: error.message }
    }
  }

  const runTest = async () => {
    const currentTime = Date.now()
    const elapsed = currentTime - startTime
    
    if (elapsed >= testDuration) {
      // Test completed
      console.log('\n📈 Performance Test Results:')
      console.log(`Total API Calls: ${measurements.totalCalls}`)
      console.log(`Total Time: ${measurements.totalTime}ms`)
      console.log(`Average Response Time: ${(measurements.totalTime / measurements.totalCalls).toFixed(2)}ms`)
      console.log(`Cache Hits: ${measurements.cacheHits} (${((measurements.cacheHits / measurements.totalCalls) * 100).toFixed(1)}%)`)
      console.log(`Errors: ${measurements.errors}`)
      console.log(`Success Rate: ${(((measurements.totalCalls - measurements.errors) / measurements.totalCalls) * 100).toFixed(1)}%`)
      
      // Calculate efficiency
      const callsPerMinute = (measurements.totalCalls / (testDuration / 60000)).toFixed(1)
      const cacheEfficiency = ((measurements.cacheHits / measurements.totalCalls) * 100).toFixed(1)
      
      console.log('\n🎯 Efficiency Metrics:')
      console.log(`API Calls per Minute: ${callsPerMinute}`)
      console.log(`Cache Efficiency: ${cacheEfficiency}%`)
      
      if (cacheEfficiency > 50) {
        console.log('✅ Good cache efficiency!')
      } else if (cacheEfficiency > 25) {
        console.log('⚠️ Moderate cache efficiency')
      } else {
        console.log('❌ Poor cache efficiency - too many unnecessary calls')
      }
      
      return
    }

    console.log(`\n[${new Date().toLocaleTimeString()}] Running API calls...`)
    
    // Test both APIs
    const portfolioResult = await testAPICall('/api/portfolio/cmff83cqw00007k7oi469g5r8', 'Portfolio API')
    const productsResult = await testAPICall('/api/products', 'Products API')
    
    measurements.portfolio.push(portfolioResult)
    measurements.products.push(productsResult)
    
    // Schedule next test
    setTimeout(runTest, testInterval)
  }

  // Start the test
  runTest()
}

// Run performance test
measureAPIPerformance()
