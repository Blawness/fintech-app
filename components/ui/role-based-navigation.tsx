'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { BottomNavigation } from './bottom-navigation'
import { AdminBottomNavigation } from './admin-bottom-navigation'

interface RoleBasedNavigationProps {
  className?: string
}

export function RoleBasedNavigation({ className }: RoleBasedNavigationProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  // Hide navigation on auth pages and other pages that shouldn't have navigation
  const noNavPages = [
    '/auth/signin', 
    '/auth/signup',
    '/auth/error',
    '/auth/verify-request',
    '/auth/signout'
  ]
  if (noNavPages.includes(pathname)) {
    return null
  }

  // Show admin navigation for admin users
  if (session?.user?.role === 'ADMIN') {
    return <AdminBottomNavigation className={className} />
  }

  // Show regular navigation for regular users
  return <BottomNavigation className={className} />
}
