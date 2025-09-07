'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Flame, BookOpen, Trophy } from 'lucide-react'

interface UserStats {
  currentStreak: number
  totalLessonsCompleted: number
  averageScore: number
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchStats()
  }, [session, status])

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/progress/${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Selamat datang di FinEdu! 🎓
          </h1>
          <p className="text-lg text-gray-600">
            Mari belajar keuangan dengan cara yang menyenangkan
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak Hari Ini</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.currentStreak || 0}</div>
              <p className="text-xs text-muted-foreground">
                hari berturut-turut
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pelajaran Selesai</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalLessonsCompleted || 0}</div>
              <p className="text-xs text-muted-foreground">
                dari total pelajaran
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skor Rata-rata</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.averageScore || 0}%</div>
              <p className="text-xs text-muted-foreground">
                dari semua quiz
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Progress Pembelajaran</CardTitle>
            <CardDescription>
              Kemajuan Anda dalam program pembelajaran keuangan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Pelajaran yang diselesaikan</span>
                <span>{stats?.totalLessonsCompleted || 0} dari 3</span>
              </div>
              <Progress 
                value={((stats?.totalLessonsCompleted || 0) / 3) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <Button 
            size="lg" 
            className="text-lg px-8 py-4"
            onClick={() => router.push('/lesson')}
          >
            Mulai Pelajaran Hari Ini
          </Button>
          <div className="text-sm text-muted-foreground">
            Pelajaran baru setiap hari untuk meningkatkan literasi keuangan Anda
          </div>
        </div>
      </div>
    </div>
  )
}
