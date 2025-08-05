'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireProfileSetup?: boolean
}

export default function ProtectedRoute({ children, requireProfileSetup = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth')
        return
      }

      if (requireProfileSetup && user ) {
        router.push('/profile-setup')
        return
      }
    }
  }, [isAuthenticated, isLoading, user, requireProfileSetup, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || (requireProfileSetup && user)) {
    return null
  }

  return <>{children}</>
}
