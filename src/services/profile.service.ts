/**
 * Profile Service - Client-side service for managing user profiles
 * Provides a clean interface for profile CRUD operations
 */

import { UserProfile } from '@prisma/client';

export interface ProfileCreateData {
  userId: string;
}

export interface ProfileUpdateData {
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  currentStep?: number;
  completedSteps?: number[];
  fullName?: string;
  preferredName?: string;
  location?: string;
  email?: string;
  phone?: string;
  disabilityTypes?: string[];
  supportNeeds?: string;
  assistiveTech?: string[];
  accommodations?: string;
  softSkills?: string[];
  hardSkills?: string[];
  industries?: string[];
  workArrangement?: string;
  education?: any[];
  experience?: any[];
  resumeUrl?: string;
  certificationUrls?: string[];
  certifications?: any[];
  customSummary?: string;
  additionalInfo?: string;
}

export interface ProfileResponse {
  success: boolean;
  data?: UserProfile & {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
      role: string;
      isProfileComplete: boolean;
      createdAt: Date;
    };
  };
  message?: string;
  error?: string;
}

export interface ProfileListResponse {
  success: boolean;
  data?: {
    profiles: (UserProfile & {
      user: {
        id: string;
        name: string | null;
        email: string | null;
        role: string;
        createdAt: Date;
      };
    })[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}

class ProfileService {
  private baseUrl = '/api/profiles';

  /**
   * Get user profile by user ID
   */
  async getProfile(userId: string): Promise<ProfileResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
      };
    }
  }

  /**
   * Create a new user profile
   */
  async createProfile(data: ProfileCreateData): Promise<ProfileResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create profile');
      }

      return result;
    } catch (error) {
      console.error('Error creating profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create profile',
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: ProfileUpdateData): Promise<ProfileResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      return result;
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  }

  /**
   * Delete user profile
   */
  async deleteProfile(userId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete profile');
      }

      return result;
    } catch (error) {
      console.error('Error deleting profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete profile',
      };
    }
  }

  /**
   * List all profiles (admin only)
   */
  async listProfiles(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ProfileListResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.status) searchParams.append('status', params.status);
      if (params?.search) searchParams.append('search', params.search);

      const url = `${this.baseUrl}?${searchParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profiles');
      }

      return data;
    } catch (error) {
      console.error('Error fetching profiles:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profiles',
      };
    }
  }

  /**
   * Complete profile setup (convenience method)
   */
  async completeProfile(userId: string, finalData: ProfileUpdateData): Promise<ProfileResponse> {
    return this.updateProfile(userId, {
      ...finalData,
      status: 'COMPLETED',
      currentStep: 6,
      completedSteps: [1, 2, 3, 4, 5, 6],
    });
  }

  /**
   * Update profile step (convenience method)
   */
  async updateStep(
    userId: string, 
    step: number, 
    stepData: ProfileUpdateData
  ): Promise<ProfileResponse> {
    return this.updateProfile(userId, {
      ...stepData,
      currentStep: step,
      status: 'IN_PROGRESS',
      completedSteps: Array.from({ length: step }, (_, i) => i + 1),
    });
  }

  /**
   * Check if profile is complete
   */
  isProfileComplete(profile: UserProfile): boolean {
    const requiredFields = [
      'fullName',
      'location', 
      'email',
      'phone',
      'disabilityTypes'
    ];

    return profile.status === 'COMPLETED' && 
           requiredFields.every(field => {
             const value = profile[field as keyof UserProfile];
             return value !== null && value !== undefined && 
                    (Array.isArray(value) ? value.length > 0 : value !== '');
           });
  }

  /**
   * Get profile completion percentage
   */
  getCompletionPercentage(profile: UserProfile): number {
    const totalSteps = 6;
    const completedSteps = profile.completedSteps?.length || 0;
    return Math.round((completedSteps / totalSteps) * 100);
  }

  /**
   * Validate profile data before submission
   */
  validateProfileData(data: ProfileUpdateData, step?: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (step === 1 || data.status === 'COMPLETED') {
      if (!data.fullName?.trim()) errors.push('Full name is required');
      if (!data.location?.trim()) errors.push('Location is required');
      if (!data.email?.trim()) errors.push('Email is required');
      if (!data.phone?.trim()) errors.push('Phone number is required');
    }

    if (step === 2 || data.status === 'COMPLETED') {
      if (!data.disabilityTypes?.length) errors.push('At least one disability type must be selected');
    }

    if (step === 3 || data.status === 'COMPLETED') {
      if (!data.softSkills?.length) errors.push('At least one soft skill must be selected');
      if (!data.hardSkills?.length) errors.push('At least one hard skill must be selected');
      if (!data.industries?.length) errors.push('At least one industry must be selected');
      if (!data.workArrangement?.trim()) errors.push('Work arrangement preference is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const profileService = new ProfileService();
