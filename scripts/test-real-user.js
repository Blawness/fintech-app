const BASE_URL = 'http://localhost:3000'

async function testRealUser() {
  try {
    console.log('Testing with real user ID...')
    
    const userId = 'cmff83cqw00007k7oi469g5r8' // Yudha Hafiz
    const response = await fetch(`${BASE_URL}/api/portfolio/${userId}`)
    
    console.log('Status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Success!')
      console.log('Portfolio data:')
      console.log(`- Total Value: Rp ${data.totalValue?.toLocaleString('id-ID') || '0'}`)
      console.log(`- Total Gain: Rp ${data.totalGain?.toLocaleString('id-ID') || '0'}`)
      console.log(`- Total Gain %: ${data.totalGainPercent?.toFixed(2) || '0.00'}%`)
      console.log(`- Holdings: ${data.holdings?.length || 0}`)
      
      if (data.holdings && data.holdings.length > 0) {
        console.log('\nHoldings:')
        data.holdings.forEach((holding, index) => {
          console.log(`${index + 1}. ${holding.product.name}`)
          console.log(`   Units: ${holding.units}`)
          console.log(`   Current Value: Rp ${holding.currentValue?.toLocaleString('id-ID') || '0'}`)
          console.log(`   Gain: Rp ${holding.gain?.toLocaleString('id-ID') || '0'}`)
        })
      }
    } else {
      const error = await response.text()
      console.log('Error:', error)
    }
  } catch (error) {
    console.log('Exception:', error.message)
  }
}

testRealUser()
