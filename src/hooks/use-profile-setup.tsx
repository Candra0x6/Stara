import { useState, useEffect, useCallback } from 'react'
import { profileSetupApi, ApiResponse } from '@/lib/api/profile-setup'
import { ProfileSetupResponse, UpdateProfileSetup } from '@/lib/validations/profile'
import { useAuth } from '@/hooks/use-auth'
import { cp } from 'fs'

export interface UseProfileSetupResult {
  // State
    profileSetup: ProfileSetupResponse | null
  loading: boolean
  error: string | null
  saving: boolean

  // Actions
  loadProfileSetup: () => Promise<void>
  updateStep: (step: number, stepData: any) => Promise<boolean>
  updateProfile: (data: UpdateProfileSetup) => Promise<boolean>
  completeProfile: () => Promise<boolean>
  deleteProfile: () => Promise<boolean>
  clearError: () => void
  
  // Computed properties
  isCompleted: boolean
  currentStep: number
  completedSteps: number[]
  canProceedToNext: (step: number) => boolean
}

export const useProfileSetup = (): UseProfileSetupResult => {
  const { isAuthenticated } = useAuth()
  const [profileSetup, setProfileSetup] = useState<ProfileSetupResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Load profile setup
  const loadProfileSetup = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await profileSetupApi.getProfileSetup()
      if (response.success && response.profileSetup) {
        setProfileSetup(response.profileSetup)
      } else if (response.error) {
        // If profile setup doesn't exist, that's okay - user hasn't started yet
        if (response.error.includes('not found')) {
          setProfileSetup(null)
        } else {
          setError(response.error)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile setup')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  // Update a specific step
  const updateStep = useCallback(async (step: number, stepData: any): Promise<boolean> => {
    setSaving(true)
    setError(null)

    try {
      const response = await profileSetupApi.updateStep(step, stepData)
      
      if (response.success && response.profileSetup) {
        setProfileSetup(response.profileSetup)
        return true
      } else if (response.error) {
        setError(response.error)
        return false
      }
      
      return false
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update step'
      setError(errorMessage)
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  // Update profile setup
  const updateProfile = useCallback(async (data: UpdateProfileSetup): Promise<boolean> => {
    setSaving(true)
    setError(null)

    try {
      let response: ApiResponse<ProfileSetupResponse>
      if (profileSetup) {
        // Update existing profile
        response = await profileSetupApi.updateProfileSetup(data)
      } else {
        // Create new profile
        response = await profileSetupApi.createProfileSetup(data)
      }
      
      if (response.success && response.profileSetup) {
        setProfileSetup(response.profileSetup)
        return true
      } else if (response.error) {
        setError(response.error)
        return false
      }
      
      return false
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
      return false
    } finally {
      setSaving(false)
    }
  }, [profileSetup])

  // Complete profile
  const completeProfile = useCallback(async (): Promise<boolean> => {
    setSaving(true)
    setError(null)

    try {
      const response = await profileSetupApi.completeProfile()
      
      if (response.success && response.profileSetup) {
        setProfileSetup(response.profileSetup)
        return true
      } else if (response.error) {
        setError(response.error)
        return false
      }
      
      return false
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete profile'
      setError(errorMessage)
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  // Delete profile
  const deleteProfile = useCallback(async (): Promise<boolean> => {
    setSaving(true)
    setError(null)

    try {
      const response = await profileSetupApi.deleteProfileSetup()
      
      if (response.success) {
        setProfileSetup(null)
        return true
      } else if (response.error) {
        setError(response.error)
        return false
      }
      
      return false
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete profile'
      setError(errorMessage)
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  // Check if user can proceed to next step
  const canProceedToNext = useCallback((step: number): boolean => {
    if (!profileSetup) return false
    // @ts-ignore
    return profileSetup.completedSteps.includes(step)
  }, [profileSetup])

  // Load profile setup on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadProfileSetup()
    }
  }, [isAuthenticated, loadProfileSetup])

  // Computed properties
  const isCompleted = profileSetup?.status === 'COMPLETED'
  const currentStep = profileSetup?.currentStep || 1
  const completedSteps = profileSetup?.completedSteps || []

  return {
    // State
    profileSetup,
    loading,
    error,
    saving,

    // Actions
    loadProfileSetup,
    updateStep,
    updateProfile,
    completeProfile,
    deleteProfile,
    clearError,

    // Computed properties
    isCompleted,
    currentStep,
    completedSteps,
    canProceedToNext,
  }
}
