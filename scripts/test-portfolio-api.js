/**
 * Test Portfolio API Fix
 * Run with: node scripts/test-portfolio-api.js
 */

const BASE_URL = 'http://localhost:3000'
const USER_ID = 'cmff83cqw00007k7oi469g5r8' // From terminal logs

async function testPortfolioAPI() {
  console.log('🧪 Testing Portfolio API Fix...\n')

  try {
    console.log(`Testing portfolio API for user ID: ${USER_ID}`)
    const startTime = Date.now()
    const response = await fetch(`${BASE_URL}/api/portfolio/${USER_ID}`)
    const endTime = Date.now()
    
    console.log(`Response time: ${endTime - startTime}ms`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Portfolio API works!')
      console.log(`Total Value: ${data.totalValue}`)
      console.log(`Holdings: ${data.holdings?.length || 0}`)
      return true
    } else {
      console.log(`❌ Portfolio API failed: ${response.status}`)
      const errorText = await response.text()
      console.log('Error details:', errorText)
      return false
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

testPortfolioAPI()