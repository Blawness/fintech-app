'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Gift, 
  Grid3X3,
  PieChart,
  ArrowUpRight
} from 'lucide-react'
import { BottomNavigation } from '@/components/ui/bottom-navigation'
import { RealTimePortfolio } from '@/components/ui/real-time-portfolio'



export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchDashboardData()
    
    // Set up real-time updates every 5 seconds
    const interval = setInterval(() => {
      fetchDashboardData(true)
    }, 5000)

    return () => clearInterval(interval)
  }, [session, status, router])

  const fetchDashboardData = async (isBackgroundUpdate = false) => {
    try {
      if (isBackgroundUpdate) {
        setIsUpdating(true)
      }


      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
      if (isBackgroundUpdate) {
        setIsUpdating(false)
      }
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <h1 className="text-2xl font-bold text-green-600">FinEdu</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-xs text-gray-500">
                {lastUpdate && `Updated: ${lastUpdate.toLocaleTimeString()}`}
                {isUpdating && (
                  <span className="ml-2 text-green-600">
                    <span className="animate-spin">⟳</span> Updating...
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs">🔔</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">52</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-32">
        {/* Portfolio Summary */}
        <div className="mb-6">
          <RealTimePortfolio userId={session.user.id} />
          <div className="flex justify-end mt-4">
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => router.push('/profile')}
            >
              Deposit
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <button 
            onClick={() => router.push('/portfolio')}
            className="text-center hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <PieChart className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Portofolio</span>
          </button>
          <button 
            onClick={() => router.push('/investment')}
            className="text-center hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Investasi</span>
          </button>
          <button 
            onClick={() => router.push('/lesson')}
            className="text-center hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Gift className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Edukasi</span>
          </button>
          <button 
            onClick={() => router.push('/explore')}
            className="text-center hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Grid3X3 className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Explore</span>
          </button>
        </div>

        {/* Investment Products */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🌱</span>
                </div>
                <CardTitle>Produk Investasi</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                className="text-green-600"
                onClick={() => router.push('/explore')}
              >
                Explore
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-lg">🌱</span>
                </div>
                <span className="text-sm font-medium">Reksa Dana</span>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-lg">🏠</span>
                </div>
                <span className="text-sm font-medium">SBN Retail</span>
                <div className="text-xs text-red-600 mt-1">Live</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-lg">🐦</span>
                </div>
                <span className="text-sm font-medium">Obligasi FR</span>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-lg">📈</span>
                </div>
                <span className="text-sm font-medium">Saham</span>
              </div>
            </div>

            {/* Featured Product */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-red-600 font-medium">Kuota menipis! Beli sebelum 15 Sep jam 12:00 WIB</span>
                <button className="text-red-400">×</button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">⭐</span>
                  </div>
                  <div>
                    <div className="font-medium">SR023-T3 - Imbal Hasil 5.8%</div>
                    <div className="text-sm text-gray-600">Kuota Tersisa 45.8%</div>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '45.8%' }}></div>
                    </div>
                  </div>
                </div>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => router.push('/investment')}
                >
                  Beli
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Promotion */}
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Mulai Investasi untuk Bisnis Kamu</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Daftarkan perusahaan ke FinEdu Bisnis untuk investasi semudah di FinEdu pribadi kamu.
                </p>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => window.open('https://finedu.id', '_blank')}
                >
                  Pelajari lebih lanjut
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <button className="text-gray-400">×</button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
