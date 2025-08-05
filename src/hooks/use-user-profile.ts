'use client'

import { UserProfile } from '@prisma/client'
import { useState, useEffect, useCallback } from 'react'


export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/profile-setup')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.profileSetup) {
        setProfile(data.profileSetup)
      } else {
        throw new Error(data.error || 'Failed to fetch profile')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])
  return {
    profile,
    loading,
    error,
    refetch: fetchProfile
  }
}
