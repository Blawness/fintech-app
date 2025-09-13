/**
 * Test database connection and data
 */

const { PrismaClient } = require('@prisma/client')

async function testDatabase() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Testing database connection...')
    
    // Test products
    console.log('\n1. Testing products...')
    const products = await prisma.investmentProduct.findMany()
    console.log(`✅ Found ${products.length} products`)
    if (products.length > 0) {
      console.log('Sample product:', {
        name: products[0].name,
        currentPrice: products[0].currentPrice,
        expectedReturn: products[0].expectedReturn
      })
    }

    // Test portfolios
    console.log('\n2. Testing portfolios...')
    const portfolios = await prisma.portfolio.findMany({
      include: {
        holdings: {
          include: {
            product: true
          }
        }
      }
    })
    console.log(`✅ Found ${portfolios.length} portfolios`)
    
    if (portfolios.length > 0) {
      const portfolio = portfolios[0]
      console.log('Sample portfolio:', {
        id: portfolio.id,
        userId: portfolio.userId,
        totalValue: portfolio.totalValue,
        totalGain: portfolio.totalGain,
        totalGainPercent: portfolio.totalGainPercent,
        holdingsCount: portfolio.holdings.length
      })
      
      if (portfolio.holdings.length > 0) {
        console.log('Sample holding:', {
          productName: portfolio.holdings[0].product.name,
          units: portfolio.holdings[0].units,
          averagePrice: portfolio.holdings[0].averagePrice,
          currentValue: portfolio.holdings[0].currentValue,
          gain: portfolio.holdings[0].gain
        })
      }
    }

    // Test specific user portfolio
    console.log('\n3. Testing test-user-id portfolio...')
    const testPortfolio = await prisma.portfolio.findUnique({
      where: { userId: 'test-user-id' },
      include: {
        holdings: {
          include: {
            product: true
          }
        }
      }
    })
    
    if (testPortfolio) {
      console.log('✅ Test user portfolio found:', {
        totalValue: testPortfolio.totalValue,
        totalGain: testPortfolio.totalGain,
        holdingsCount: testPortfolio.holdings.length
      })
    } else {
      console.log('❌ Test user portfolio not found')
    }

  } catch (error) {
    console.error('❌ Database test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
