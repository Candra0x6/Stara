'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name?: string | null
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  role?: string
  image?: string | null
  isProfileComplete?: boolean
}

interface SessionData {
  user: User | null
  authenticated: boolean
  session?: {
    expires: string
  }
}

export function useApiSession(requireAuth = false) {
  const [sessionData, setSessionData] = useState<SessionData>({
    user: null,
    authenticated: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setSessionData(data)
      } else {
        setSessionData({ user: null, authenticated: false })
      }
    } catch (error) {
      console.error('Session check error:', error)
      setSessionData({ user: null, authenticated: false })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string, remember = false) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, remember }),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh session data
        await checkSession()
        return { success: true, data }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed' }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    role: string
    agreeToTerms: boolean
    agreeToPrivacy: boolean
    subscribeNewsletter?: boolean
  }) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        // Session should be automatically created
        await checkSession()
        return { success: true, data }
      } else {
        return { success: false, error: data.error, details: data.details }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/session', {
        method: 'DELETE',
        credentials: 'include'
      })
      
      setSessionData({ user: null, authenticated: false })
      router.push('/auth')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  useEffect(() => {
    checkSession()
  }, [checkSession])

  useEffect(() => {
    if (requireAuth && !isLoading && !sessionData.authenticated) {
      router.push('/auth')
    }
  }, [requireAuth, isLoading, sessionData.authenticated, router])

  return {
    user: sessionData.user,
    authenticated: sessionData.authenticated,
    isLoading,
    login,
    register,
    logout,
    refreshSession: checkSession
  }
}

export function useRequireApiAuth() {
  return useApiSession(true)
}
