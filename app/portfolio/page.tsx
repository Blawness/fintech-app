import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PortfolioOverview } from './portfolio-overview'
import { PortfolioHoldings } from './portfolio-holdings'
import { PortfolioTransactions } from './portfolio-transactions'

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Get user portfolio
  const portfolio = await prisma.portfolio.findUnique({
    where: { userId: session.user.id },
    include: {
      holdings: {
        include: {
          product: true
        }
      }
    }
  })

  // Get user transactions
  const transactions = await prisma.investmentTransaction.findMany({
    where: { userId: session.user.id },
    include: {
      product: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  // Create portfolio if doesn't exist
  if (!portfolio) {
    const newPortfolio = await prisma.portfolio.create({
      data: {
        userId: session.user.id,
        riskProfile: 'KONSERVATIF',
        rdnBalance: 1000000, // Starting balance
        tradingBalance: 0
      },
      include: {
        holdings: {
          include: {
            product: true
          }
        }
      }
    })
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio</h1>
            <p className="text-gray-600">Kelola investasi dan pantau performa portfolio Anda</p>
          </div>
          
          <PortfolioOverview portfolio={newPortfolio} />
          <PortfolioHoldings holdings={newPortfolio.holdings} />
          <PortfolioTransactions transactions={[]} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio</h1>
          <p className="text-gray-600">Kelola investasi dan pantau performa portfolio Anda</p>
        </div>
        
        <PortfolioOverview portfolio={portfolio} />
        <PortfolioHoldings holdings={portfolio.holdings} />
        <PortfolioTransactions transactions={transactions} />
      </div>
    </div>
  )
}