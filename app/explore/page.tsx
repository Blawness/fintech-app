'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search,
  TrendingUp,
  TrendingDown,
  Plus
} from 'lucide-react'
import { BottomNavigation } from '@/components/ui/bottom-navigation'

interface InvestmentProduct {
  id: string
  name: string
  type: string
  category: string
  expectedReturn: number
  minInvestment: number
  currentPrice: number
  description: string
  isLive?: boolean
  quotaRemaining?: number
}

interface WatchlistItem {
  id: string
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  logo: string
}

export default function ExplorePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [, setProducts] = useState<InvestmentProduct[]>([])
  const [, setWatchlist] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchExploreData = useCallback(async () => {
    try {
      // Fetch investment products
      const productsResponse = await fetch('/api/products')
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData)
      }

      // Fetch watchlist
      const watchlistResponse = await fetch(`/api/watchlist/${session?.user?.id}`)
      if (watchlistResponse.ok) {
        const watchlistData = await watchlistResponse.json()
        setWatchlist(watchlistData)
      }
    } catch (error) {
      console.error('Error fetching explore data:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchExploreData()
  }, [session, status, router, fetchExploreData])

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
          <h1 className="text-xl font-semibold">Explore</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-32">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Cari produk investasi"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Investment Products */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Produk Investasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          </CardContent>
        </Card>

        {/* Watchlist */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Watchlist</CardTitle>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Tambah
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* ASII */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">A</span>
                  </div>
                  <div>
                    <div className="font-medium">ASII</div>
                    <div className="text-sm text-gray-600">Astra International Tbk.</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">Rp5,550</div>
                  <div className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +1.37%
                  </div>
                </div>
              </div>

              {/* BBCA */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">B</span>
                  </div>
                  <div>
                    <div className="font-medium">BBCA</div>
                    <div className="text-sm text-gray-600">Bank Central Asia Tbk.</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">Rp7,850</div>
                  <div className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +0.64%
                  </div>
                </div>
              </div>

              {/* TLKM */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">T</span>
                  </div>
                  <div>
                    <div className="font-medium">TLKM</div>
                    <div className="text-sm text-gray-600">PT Telkom Indonesia (Persero) Tbk</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">Rp3,080</div>
                  <div className="text-sm text-red-600 flex items-center">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -2.22%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
