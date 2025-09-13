'use client'

import { useRouter, usePathname } from 'next/navigation'

interface AdminBottomNavigationProps {
  className?: string
}

export function AdminBottomNavigation({ className = '' }: AdminBottomNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()

  const adminNavItems = [
    {
      path: '/admin/dashboard',
      icon: '🏠',
      label: 'Dashboard'
    },
    {
      path: '/admin/products',
      icon: '📊',
      label: 'Produk'
    },
    {
      path: '/admin/transactions',
      icon: '💳',
      label: 'Transaksi'
    },
    {
      path: '/admin/users',
      icon: '👥',
      label: 'Users'
    },
    {
      path: '/admin/analytics',
      icon: '📈',
      label: 'Analytics'
    }
  ]

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return pathname === '/admin/dashboard' || pathname === '/admin'
    }
    return pathname.startsWith(path)
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 ${className}`}>
      <div className="grid grid-cols-5">
        {adminNavItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center py-3 transition-colors ${
              isActive(item.path)
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="w-6 h-6 mb-1 text-lg">{item.icon}</div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
