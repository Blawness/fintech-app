/**
 * Debug script for Portfolio Calculation
 * Run with: node scripts/debug-portfolio.js
 */

const BASE_URL = 'http://localhost:3000'

async function debugPortfolio() {
  console.log('🔍 Debugging Portfolio Calculation...\n')

  try {
    // Test portfolio API
    console.log('1. Testing Portfolio API...')
    const response = await fetch(`${BASE_URL}/api/portfolio/test-user-id`)
    
    if (!response.ok) {
      throw new Error(`Portfolio API failed: ${response.status}`)
    }

    const portfolioData = await response.json()
    console.log('✅ Portfolio API Response:')
    console.log('   - Portfolio ID:', portfolioData.id)
    console.log('   - User ID:', portfolioData.userId)
    console.log('   - Total Value:', portfolioData.totalValue)
    console.log('   - Total Gain:', portfolioData.totalGain)
    console.log('   - Total Gain %:', portfolioData.totalGainPercent)
    console.log('   - RDN Balance:', portfolioData.rdnBalance)
    console.log('   - Trading Balance:', portfolioData.tradingBalance)
    console.log('   - Risk Profile:', portfolioData.riskProfile)
    console.log('   - Holdings Count:', portfolioData.holdings?.length || 0)

    // Debug individual holdings
    if (portfolioData.holdings && portfolioData.holdings.length > 0) {
      console.log('\n2. Debugging Individual Holdings:')
      let calculatedTotalValue = 0
      let calculatedTotalGain = 0

      portfolioData.holdings.forEach((holding, index) => {
        console.log(`\n   Holding ${index + 1}:`)
        console.log(`   - Product: ${holding.product.name}`)
        console.log(`   - Units: ${holding.units}`)
        console.log(`   - Average Price: Rp ${holding.averagePrice?.toLocaleString('id-ID') || '0'}`)
        console.log(`   - Current Price: Rp ${holding.product.currentPrice?.toLocaleString('id-ID') || '0'}`)
        console.log(`   - Current Value: Rp ${holding.currentValue?.toLocaleString('id-ID') || '0'}`)
        console.log(`   - Gain: Rp ${holding.gain?.toLocaleString('id-ID') || '0'}`)
        console.log(`   - Gain %: ${holding.gainPercent?.toFixed(2) || '0.00'}%`)

        // Manual calculation
        const manualCurrentValue = holding.units * holding.product.currentPrice
        const manualGain = manualCurrentValue - (holding.averagePrice * holding.units)
        const manualGainPercent = (manualGain / (holding.averagePrice * holding.units)) * 100

        console.log(`   - Manual Current Value: Rp ${manualCurrentValue?.toLocaleString('id-ID') || '0'}`)
        console.log(`   - Manual Gain: Rp ${manualGain?.toLocaleString('id-ID') || '0'}`)
        console.log(`   - Manual Gain %: ${manualGainPercent?.toFixed(2) || '0.00'}%`)

        calculatedTotalValue += manualCurrentValue
        calculatedTotalGain += manualGain
      })

      console.log('\n3. Portfolio Calculation Summary:')
      console.log(`   - API Total Value: Rp ${portfolioData.totalValue?.toLocaleString('id-ID') || '0'}`)
      console.log(`   - Calculated Total Value: Rp ${calculatedTotalValue?.toLocaleString('id-ID') || '0'}`)
      console.log(`   - API Total Gain: Rp ${portfolioData.totalGain?.toLocaleString('id-ID') || '0'}`)
      console.log(`   - Calculated Total Gain: Rp ${calculatedTotalGain?.toLocaleString('id-ID') || '0'}`)
      console.log(`   - Values Match: ${portfolioData.totalValue === calculatedTotalValue ? '✅' : '❌'}`)
      console.log(`   - Gains Match: ${portfolioData.totalGain === calculatedTotalGain ? '✅' : '❌'}`)

      if (portfolioData.totalValue === 0 && calculatedTotalValue > 0) {
        console.log('\n❌ ISSUE FOUND: API returns 0 but calculated value is > 0')
        console.log('   This suggests the portfolio update in the API is not working correctly.')
      }
    } else {
      console.log('\n2. No holdings found in portfolio')
    }

    // Test products API
    console.log('\n4. Testing Products API...')
    const productsResponse = await fetch(`${BASE_URL}/api/products`)
    if (productsResponse.ok) {
      const productsData = await productsResponse.json()
      console.log(`   - Products Count: ${productsData.length}`)
      if (productsData.length > 0) {
        console.log('   - Sample Product:')
        const sampleProduct = productsData[0]
        console.log(`     * Name: ${sampleProduct.name}`)
        console.log(`     * Current Price: Rp ${sampleProduct.currentPrice?.toLocaleString('id-ID') || '0'}`)
        console.log(`     * Expected Return: ${sampleProduct.expectedReturn}%`)
        console.log(`     * Risk Level: ${sampleProduct.riskLevel}`)
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Make sure the server is running (npm run dev)')
    console.log('2. Check if user has holdings in the database')
    console.log('3. Verify products have current prices')
    console.log('4. Check database connection')
  }
}

// Run debug
debugPortfolio()
