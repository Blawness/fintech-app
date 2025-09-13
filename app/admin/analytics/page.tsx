import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function AdminAnalytics() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  // Get analytics data
  const [
    totalUsers,
    totalProducts,
    totalTransactions,
    activeProducts,
    totalLessons,
    completedLessons,
    recentTransactions,
    userGrowth
  ] = await Promise.all([
    prisma.user.count(),
    prisma.investmentProduct.count(),
    prisma.investmentTransaction.count(),
    prisma.investmentProduct.count({ where: { isActive: true } }),
    prisma.lesson.count(),
    prisma.userProgress.count(),
    prisma.investmentTransaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true } }
      }
    }),
    prisma.user.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' }
    })
  ])

  // Calculate user growth by month
  const userGrowthByMonth = userGrowth.reduce((acc, user) => {
    const month = new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const stats = [
    {
      name: 'Total Pengguna',
      value: totalUsers,
      icon: '👥',
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      name: 'Total Produk',
      value: totalProducts,
      icon: '📊',
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      name: 'Produk Aktif',
      value: activeProducts,
      icon: '✅',
      color: 'bg-emerald-500',
      change: '+2%'
    },
    {
      name: 'Total Transaksi',
      value: totalTransactions,
      icon: '💳',
      color: 'bg-purple-500',
      change: '+18%'
    },
    {
      name: 'Pelajaran Selesai',
      value: completedLessons,
      icon: '📚',
      color: 'bg-orange-500',
      change: '+25%'
    },
    {
      name: 'Total Pelajaran',
      value: totalLessons,
      icon: '🎓',
      color: 'bg-indigo-500',
      change: '0%'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Laporan</h1>
        <p className="mt-2 text-gray-600">
          Pantau performa aplikasi dan aktivitas pengguna
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString('id-ID')}</p>
                <p className="text-sm text-green-600">{stat.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Transaksi Terbaru</h2>
          </div>
          <div className="p-6">
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.user.name || transaction.user.email}
                      </p>
                      <p className="text-xs text-gray-500">{transaction.product.name}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        transaction.type === 'BUY' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'BUY' ? '+' : '-'}Rp {transaction.totalValue.toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">💳</div>
                <p className="text-gray-500">Belum ada transaksi</p>
              </div>
            )}
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Pertumbuhan Pengguna</h2>
          </div>
          <div className="p-6">
            {Object.keys(userGrowthByMonth).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(userGrowthByMonth).map(([month, count]) => (
                  <div key={month} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{month}</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(count / Math.max(...Object.values(userGrowthByMonth))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📈</div>
                <p className="text-gray-500">Data pertumbuhan belum tersedia</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Aksi Cepat</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/products"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Kelola Produk</h3>
                <p className="text-sm text-gray-600">Tambah atau edit produk investasi</p>
              </div>
            </a>

            <a
              href="/admin/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Kelola Users</h3>
                <p className="text-sm text-gray-600">Lihat data pengguna</p>
              </div>
            </a>

            <a
              href="/admin/dashboard"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="bg-purple-100 rounded-lg p-3 mr-4">
                <span className="text-2xl">🏠</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Dashboard</h3>
                <p className="text-sm text-gray-600">Kembali ke dashboard utama</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
