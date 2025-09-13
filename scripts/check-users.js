const { PrismaClient } = require('@prisma/client')

async function checkUsers() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Checking users in database...')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })
    
    console.log(`Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`- ${user.id}: ${user.name} (${user.email}) - ${user.role}`)
    })
    
    if (users.length > 0) {
      const firstUser = users[0]
      console.log(`\nTesting portfolio for user: ${firstUser.id}`)
      
      const portfolio = await prisma.portfolio.findUnique({
        where: { userId: firstUser.id },
        include: {
          holdings: {
            include: {
              product: true
            }
          }
        }
      })
      
      if (portfolio) {
        console.log('Portfolio found:')
        console.log(`- Total Value: Rp ${portfolio.totalValue?.toLocaleString('id-ID') || '0'}`)
        console.log(`- Holdings: ${portfolio.holdings.length}`)
      } else {
        console.log('No portfolio found for this user')
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
