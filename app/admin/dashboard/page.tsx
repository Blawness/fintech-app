import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  // Get admin statistics
  const [
    totalUsers,
    totalProducts,
    totalTransactions,
    activeProducts
  ] = await Promise.all([
    prisma.user.count(),
    prisma.investmentProduct.count(),
    prisma.investmentTransaction.count(),
    prisma.investmentProduct.count({ where: { isActive: true } })
  ])

  const stats = [
    {
      name: 'Total Users',
      value: totalUsers,
      icon: '👥',
      color: 'bg-blue-500'
    },
    {
      name: 'Total Products',
      value: totalProducts,
      icon: '📊',
      color: 'bg-green-500'
    },
    {
      name: 'Active Products',
      value: activeProducts,
      icon: '✅',
      color: 'bg-emerald-500'
    },
    {
      name: 'Total Transactions',
      value: totalTransactions,
      icon: '💳',
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Kelola platform investasi dan monitor aktivitas pengguna
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
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
                <p className="text-sm text-gray-600">Tambah, edit, atau hapus produk investasi</p>
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
                <p className="text-sm text-gray-600">Lihat dan kelola data pengguna</p>
              </div>
            </a>

            <a
              href="/admin/analytics"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="bg-purple-100 rounded-lg p-3 mr-4">
                <span className="text-2xl">📈</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-600">Lihat statistik dan laporan</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
