import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function BalanceInjectionsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  // Get all balance injection transactions
  const injections = await prisma.investmentTransaction.findMany({
    where: {
      productId: 'BALANCE_INJECTION'
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Calculate total injections
  const totalInjected = injections.reduce((sum, injection) => sum + injection.amount, 0)
  const totalUsers = new Set(injections.map(i => i.userId)).size

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Riwayat Injeksi Saldo</h1>
            <p className="mt-2 text-gray-600">
              Pantau semua injeksi saldo yang telah diberikan kepada pengguna
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3 mr-4">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Injeksi</p>
              <p className="text-2xl font-bold text-gray-900">
                Rp {totalInjected.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-lg p-3 mr-4">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
              <p className="text-2xl font-bold text-gray-900">{injections.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Injections Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Daftar Injeksi Saldo</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah Injeksi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {injections.map((injection) => (
                <tr key={injection.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {injection.user.name?.charAt(0).toUpperCase() || injection.user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {injection.user.name || 'Tidak ada nama'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {injection.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-bold text-green-600">
                      +Rp {injection.amount.toLocaleString('id-ID')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {injection.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(injection.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(injection.createdAt).toLocaleTimeString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {injections.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada injeksi saldo</h3>
          <p className="text-gray-600">Riwayat injeksi saldo akan muncul di sini</p>
        </div>
      )}
    </div>
  )
}

