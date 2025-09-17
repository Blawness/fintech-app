'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  User,
  Settings,
  FileText,
  MessageCircle,
  Moon,
  Building,
  Gift,
  Tag,
  Calendar,
  CreditCard,
  ArrowRight,
  Wallet,
  LogOut
} from 'lucide-react'
import { BottomNavigation } from '@/components/ui/bottom-navigation'

interface UserProfile {
  name: string
  email: string
  riskProfile: string
  rdnBalance: number
  tradingBalance: number
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showValues] = useState(false)

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`/api/profile/${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
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

    fetchProfile()
  }, [session, status, router, fetchProfile])

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/auth/signin' })
    } catch (error) {
      console.error('Error during logout:', error)
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
          <h1 className="text-xl font-semibold">Profil</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-32">
        {/* User Profile Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {profile?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{profile?.name || 'User'}</h2>
                <p className="text-green-600 text-sm">
                  {profile?.riskProfile || 'Investor Agresif'}
                </p>
              </div>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">RDN Wallet</div>
                      <div className="font-semibold">
                        {showValues ? `Rp ${profile?.rdnBalance?.toLocaleString('id-ID') || '0'}` : '••••••'}
                      </div>
                    </div>
                    <Wallet className="w-6 h-6 text-gray-400" />
                  </div>
                  <Button variant="ghost" className="w-full mt-2 text-green-600">
                    Deposit RDN Wallet
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">GoPay</div>
                      <div className="font-semibold text-gray-400">Belum Terhubung</div>
                    </div>
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                  </div>
                  <Button variant="ghost" className="w-full mt-2 text-blue-600">
                    Hubungkan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Menu Options */}
        <div className="space-y-2">
          {/* Personal & Account Management */}
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <span>Data Pribadi</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span>Settings</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span>E-Statement</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                  <span>Chat Support</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* Investment & App Features */}
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-3">
                  <Moon className="w-5 h-5 text-gray-600" />
                  <span>Bibit Syariah</span>
                </div>
                <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <Moon className="w-5 h-5 text-gray-600" />
                  <span>Dark Mode</span>
                </div>
                <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business & Promotional Features */}
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-gray-600" />
                    <span>Bibit untuk Perusahaan</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="mt-2">
                  <Button variant="ghost" className="text-green-600 p-0 h-auto">
                    Buat Akun Bisnis
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-3">
                  <Gift className="w-5 h-5 text-gray-600" />
                  <span>Cashback & Referral</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-3">
                  <Tag className="w-5 h-5 text-gray-600" />
                  <span>Promo & Voucher</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span>Systematic Investment Plan (SIP)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <span>Gift Card</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* Logout Section */}
          <Card className="mb-6">
            <CardContent className="p-0">
              <button
                onClick={handleLogout}
                className="flex items-center justify-between p-4 w-full text-left hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <LogOut className="w-5 h-5 text-red-600" />
                  <span className="text-red-600 font-medium">Logout</span>
                </div>
                <ArrowRight className="w-4 h-4 text-red-400" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
