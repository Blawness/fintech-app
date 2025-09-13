/**
 * Simple test script
 */

const BASE_URL = 'http://localhost:3000'

async function simpleTest() {
  try {
    console.log('Testing products API...')
    const productsResponse = await fetch(`${BASE_URL}/api/products`)
    if (productsResponse.ok) {
      const products = await productsResponse.json()
      console.log('✅ Products API works')
      console.log('Products count:', products.length)
      if (products.length > 0) {
        console.log('Sample product:', {
          name: products[0].name,
          currentPrice: products[0].currentPrice,
          expectedReturn: products[0].expectedReturn
        })
      }
    } else {
      console.log('❌ Products API failed:', productsResponse.status)
    }

    console.log('\nTesting portfolio API...')
    const portfolioResponse = await fetch(`${BASE_URL}/api/portfolio/test-user-id`)
    if (portfolioResponse.ok) {
      const portfolio = await portfolioResponse.json()
      console.log('✅ Portfolio API works')
      console.log('Portfolio data:', {
        totalValue: portfolio.totalValue,
        totalGain: portfolio.totalGain,
        totalGainPercent: portfolio.totalGainPercent,
        holdingsCount: portfolio.holdings?.length || 0
      })
    } else {
      console.log('❌ Portfolio API failed:', portfolioResponse.status)
      const errorText = await portfolioResponse.text()
      console.log('Error details:', errorText)
    }

  } catch (error) {
    console.error('Test failed:', error.message)
  }
}

simpleTest()
