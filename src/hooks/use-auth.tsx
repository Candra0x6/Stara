'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useAuth(requireAuth = false) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const isLoading = status === 'loading'
  const isAuthenticated = !!session?.user

  useEffect(() => {
    if (requireAuth && !isLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [requireAuth, isLoading, isAuthenticated, router])

  return {
    session,
    user: session?.user,
    isLoading,
    isAuthenticated: !!session,
    status
  }
}

export function useRequireAuth() {
  return useAuth(true)
}
