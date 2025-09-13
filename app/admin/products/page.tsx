import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ProductsList } from './products-list'

export default async function AdminProducts() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  const products = await prisma.investmentProduct.findMany({
    orderBy: { createdAt: 'desc' }
  })


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Produk Investasi</h1>
            <p className="mt-2 text-gray-600">
              Tambah, edit, dan kelola produk investasi yang tersedia
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Tambah Produk
          </Link>
        </div>
      </div>

      {/* Products Table */}
      <ProductsList initialProducts={products} />
    </div>
  )
}
