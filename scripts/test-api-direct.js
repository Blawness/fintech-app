/**
 * Test API directly without Prisma
 */

const BASE_URL = 'http://localhost:3000'

async function testAPIDirect() {
  try {
    console.log('Testing API endpoints directly...\n')

    // Test 1: Products API
    console.log('1. Testing /api/products...')
    const productsResponse = await fetch(`${BASE_URL}/api/products`)
    if (productsResponse.ok) {
      const products = await productsResponse.json()
      console.log(`✅ Products API: ${products.length} products found`)
      if (products.length > 0) {
        const product = products[0]
        console.log(`   Sample: ${product.name} - Rp ${product.currentPrice?.toLocaleString('id-ID') || '0'}`)
      }
    } else {
      console.log(`❌ Products API failed: ${productsResponse.status}`)
    }

    // Test 2: Investment Portfolio API
    console.log('\n2. Testing /api/investment/portfolio...')
    const investmentPortfolioResponse = await fetch(`${BASE_URL}/api/investment/portfolio`)
    if (investmentPortfolioResponse.ok) {
      const portfolio = await investmentPortfolioResponse.json()
      console.log('✅ Investment Portfolio API works')
      console.log(`   Total Value: Rp ${portfolio.totalValue?.toLocaleString('id-ID') || '0'}`)
      console.log(`   Total Gain: Rp ${portfolio.totalGain?.toLocaleString('id-ID') || '0'}`)
      console.log(`   Total Gain %: ${portfolio.totalGainPercent?.toFixed(2) || '0.00'}%`)
      console.log(`   Holdings: ${portfolio.holdings?.length || 0}`)
    } else {
      console.log(`❌ Investment Portfolio API failed: ${investmentPortfolioResponse.status}`)
    }

    // Test 3: Market Simulate API
    console.log('\n3. Testing /api/market/simulate...')
    const simulateResponse = await fetch(`${BASE_URL}/api/market/simulate`, {
      method: 'POST'
    })
    if (simulateResponse.ok) {
      const simulateData = await simulateResponse.json()
      console.log('✅ Market Simulate API works')
      console.log(`   Updated: ${simulateData.updated} products`)
    } else {
      console.log(`❌ Market Simulate API failed: ${simulateResponse.status}`)
    }

    // Test 4: Try to access portfolio with different user IDs
    console.log('\n4. Testing portfolio with different user IDs...')
    const testUserIds = ['test-user-id', 'user-1', 'admin-user']
    
    for (const userId of testUserIds) {
      try {
        const response = await fetch(`${BASE_URL}/api/portfolio/${userId}`)
        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Portfolio API for ${userId}:`)
          console.log(`   Total Value: Rp ${data.totalValue?.toLocaleString('id-ID') || '0'}`)
          console.log(`   Holdings: ${data.holdings?.length || 0}`)
          break
        } else {
          console.log(`❌ Portfolio API for ${userId}: ${response.status}`)
        }
      } catch (error) {
        console.log(`❌ Portfolio API for ${userId}: ${error.message}`)
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAPIDirect()
