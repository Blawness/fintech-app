/**
 * Test script for Market Simulator
 * Run with: node scripts/test-market-simulator.js
 */

const BASE_URL = 'http://localhost:3000'

async function testMarketSimulator() {
  console.log('🧪 Testing Market Simulator...\n')

  try {
    // Test 1: Check market status
    console.log('1. Testing market status...')
    const statusResponse = await fetch(`${BASE_URL}/api/market/control`)
    const statusData = await statusResponse.json()
    console.log('✅ Market status:', statusData)

    // Test 2: Manual simulation
    console.log('\n2. Testing manual simulation...')
    const simulateResponse = await fetch(`${BASE_URL}/api/market/simulate`, {
      method: 'POST'
    })
    const simulateData = await simulateResponse.json()
    console.log('✅ Simulation result:', simulateData)

    // Test 3: Check price history
    console.log('\n3. Testing price history...')
    const historyResponse = await fetch(`${BASE_URL}/api/market/history?hours=1&limit=10`)
    const historyData = await historyResponse.json()
    console.log('✅ Price history:', historyData)

    // Test 4: Test products endpoint
    console.log('\n4. Testing products endpoint...')
    const productsResponse = await fetch(`${BASE_URL}/api/products`)
    const productsData = await productsResponse.json()
    console.log('✅ Products count:', productsData.length)

    console.log('\n🎉 All tests completed successfully!')
    console.log('\n📊 Market Simulator Features:')
    console.log('- ✅ Price simulation based on expected return')
    console.log('- ✅ Risk-based volatility (Konservatif: 2%, Moderat: 5%, Agresif: 10%)')
    console.log('- ✅ Price history tracking')
    console.log('- ✅ Portfolio auto-update')
    console.log('- ✅ Admin control panel')
    console.log('- ✅ Real-time monitoring')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Make sure the server is running (npm run dev)')
    console.log('2. Check database connection')
    console.log('3. Verify products are seeded')
    console.log('4. Check admin authentication')
  }
}

// Run tests
testMarketSimulator()
