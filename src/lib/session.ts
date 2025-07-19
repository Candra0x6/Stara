import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

/**
 * Server-side session utilities
 */
export async function getAuthSession() {
  return await getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getAuthSession()
  
  if (!session?.user) {
    redirect('/auth')
  }
  
  return session
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth()
  
  if (!session.user.role || !allowedRoles.includes(session.user.role)) {
    redirect('/unauthorized')
  }
  
  return session
}

/**
 * Client-side session utilities
 */
export function getSessionCookies() {
  if (typeof window === 'undefined') return {}
  
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)
  
  return cookies
}

export function isRemembered() {
  const cookies = getSessionCookies()
  return cookies['remember-me'] === 'true'
}

export function clearRememberMe() {
  if (typeof window !== 'undefined') {
    document.cookie = 'remember-me=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  }
}
