import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { RealTimePortfolioOverview } from '@/components/ui/real-time-portfolio-overview'
import { RealTimePortfolioHoldings } from '@/components/ui/real-time-portfolio-holdings'
import { RealTimePortfolioTransactions } from '@/components/ui/real-time-portfolio-transactions'

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // No need to fetch data here since we're using real-time components

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio</h1>
          <p className="text-gray-600">Kelola investasi dan pantau performa portfolio Anda</p>
        </div>
        
        <RealTimePortfolioOverview userId={session.user.id} />
        <RealTimePortfolioHoldings userId={session.user.id} />
        <RealTimePortfolioTransactions userId={session.user.id} />
      </div>
    </div>
  )
}