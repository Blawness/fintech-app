import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN'
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

export async function getUserRole(): Promise<Role | null> {
  const session = await getServerSession(authOptions)
  return session?.user?.role as Role || null
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === ROLES.ADMIN
}

export async function isUser(): Promise<boolean> {
  const role = await getUserRole()
  return role === ROLES.USER
}

export function hasRole(userRole: string, requiredRole: Role): boolean {
  if (requiredRole === ROLES.ADMIN) {
    return userRole === ROLES.ADMIN
  }
  return true // USER role can access user routes
}
