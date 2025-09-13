'use client'

import { useRouter, usePathname } from 'next/navigation'

interface BottomNavigationProps {
  className?: string
}

export function BottomNavigation({ className = '' }: BottomNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    {
      path: '/',
      icon: '🏠',
      label: 'Home'
    },
    {
      path: '/lesson',
      icon: '📚',
      label: 'Pelajaran'
    },
    {
      path: '/investment',
      icon: '💰',
      label: 'Investasi'
    },
    {
      path: '/portfolio',
      icon: '📊',
      label: 'Portfolio'
    },
    {
      path: '/profile',
      icon: '👤',
      label: 'Profil'
    }
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname === path
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t ${className}`}>
      <div className="grid grid-cols-5">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center py-2 transition-colors ${
              isActive(item.path)
                ? 'text-green-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className="w-6 h-6 mb-1">{item.icon}</div>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
