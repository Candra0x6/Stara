import { 
  ProfileSetup, 
  UpdateProfileSetup, 
  ProfileSetupResponse,
  validateStep
} from '@/lib/validations/profile'

export interface ApiResponse<T = any> {
  success?: boolean
  profileSetup?: T
  step?: number
  stepData?: any
  isCompleted?: boolean
  currentStep?: number
  status?: string
  message?: string
  error?: string
  details?: any[]
}

class ProfileSetupApiClient {
  private baseUrl = '/api/user/profile-setup'

  /**
   * Get current user's profile setup
   */
  async getProfileSetup(): Promise<ApiResponse<ProfileSetupResponse>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile setup')
      }

      return {
        success: true,
        profileSetup: data.profileSetup,
        message: data.message
      }
    } catch (error) {
      console.error('Error fetching profile setup:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Create a new profile setup
   */
  async createProfileSetup(data: Partial<ProfileSetup>): Promise<ApiResponse<ProfileSetupResponse>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create profile setup')
      }

      return {
        success: true,
        profileSetup: result.profileSetup,
        message: result.message
      }
    } catch (error) {
      console.error('Error creating profile setup:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Update profile setup
   */
  async updateProfileSetup(data: UpdateProfileSetup): Promise<ApiResponse<ProfileSetupResponse>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile setup')
      }

      return {
        success: true,
        profileSetup: result.profileSetup,
        message: result.message
      }
    } catch (error) {
      console.error('Error updating profile setup:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Update a specific step
   */
  async updateStep(step: number, stepData: any): Promise<ApiResponse<ProfileSetupResponse>> {
    try {
      // Validate step data before sending
      const validatedData = validateStep(step, stepData)

      const response = await fetch(`${this.baseUrl}/step/${step}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Failed to update step ${step}`)
      }

      return {
        success: true,
        profileSetup: result.profileSetup,
        step: result.step,
        message: result.message
      }
    } catch (error) {
      console.error(`Error updating step ${step}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Get specific step data
   */
  async getStepData(step: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/step/${step}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Failed to fetch step ${step} data`)
      }

      return {
        success: true,
        step: result.step,
        stepData: result.stepData,
        isCompleted: result.isCompleted,
        currentStep: result.currentStep,
        status: result.status,
        message: result.message
      }
    } catch (error) {
      console.error(`Error fetching step ${step} data:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Complete the profile setup
   */
  async completeProfile(): Promise<ApiResponse<ProfileSetupResponse>> {
    try {
      const response = await this.updateProfileSetup({
        status: 'COMPLETED',
        currentStep: 6
      })

      return response
    } catch (error) {
      console.error('Error completing profile:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Delete profile setup
   */
  async deleteProfileSetup(): Promise<ApiResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete profile setup')
      }

      return {
        success: true,
        message: result.message
      }
    } catch (error) {
      console.error('Error deleting profile setup:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}

// Export singleton instance
export const profileSetupApi = new ProfileSetupApiClient()
export default profileSetupApi
