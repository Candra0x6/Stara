import prisma from '@/lib/prisma'
import { 
  ProfileSetup, 
  CreateProfileSetup, 
  UpdateProfileSetup,
  ProfileSetupResponse,
  ProfileSetupQuery
} from '@/lib/validations/profile'
import { Prisma } from '@prisma/client'

export class ProfileSetupService {
  
  /**
   * Get profile setup by user ID
   */
  static async getByUserId(userId: string): Promise<ProfileSetupResponse | null> {
    try {
      const profileSetup = await prisma.userProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      })

      if (!profileSetup) {
        return null
      }

      return this.formatResponse(profileSetup)
    } catch (error) {
      console.error('Error getting profile setup by user ID:', error)
      throw new Error('Failed to retrieve profile setup')
    }
  }

  /**
   * Get profile setup by ID
   */
  static async getById(id: string): Promise<ProfileSetupResponse | null> {
    try {
      const profileSetup = await prisma.userProfile.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      })

      if (!profileSetup) {
        return null
      }

      return this.formatResponse(profileSetup)
    } catch (error) {
      console.error('Error getting profile setup by ID:', error)
      throw new Error('Failed to retrieve profile setup')
    }
  }

  /**
   * Create new profile setup
   */
  static async create(data: CreateProfileSetup): Promise<ProfileSetupResponse> {
    try {
      // Check if profile setup already exists for this user
      const existing = await prisma.userProfile.findUnique({
        where: { userId: data.userId }
      })

      if (existing) {
        throw new Error('Profile setup already exists for this user')
      }

      // Ensure user exists
      const user = await prisma.user.findUnique({
        where: { id: data.userId }
      })

      if (!user) {
        throw new Error('User not found')
      }

      const profileSetup = await prisma.userProfile.create({
        data: {
          userId: data.userId,
          status: data.status || 'NOT_STARTED',
          currentStep: data.currentStep || 1,
          completedSteps: data.completedSteps || [],
          fullName: data.fullName,
          preferredName: data.preferredName,
          location: data.location,
          email: data.email,
          phone: data.phone,
          disabilityTypes: data.disabilityTypes || [],
          supportNeeds: data.supportNeeds,
          assistiveTech: data.assistiveTech || [],
          accommodations: data.accommodations,
          softSkills: data.softSkills || [],
          hardSkills: data.hardSkills || [],
          industries: data.industries || [],
          workArrangement: data.workArrangement,
          education: data.education || [],
          experience: data.experience || [],
          resumeUrl: data.resumeUrl,
          certifications: data.certifications || [],
          customSummary: data.customSummary,
          additionalInfo: data.additionalInfo,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      })

      return this.formatResponse(profileSetup)
    } catch (error) {
      console.error('Error creating profile setup:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to create profile setup')
    }
  }

  /**
   * Update profile setup
   */
  static async update(id: string, data: UpdateProfileSetup): Promise<ProfileSetupResponse> {
    try {
      const existing = await prisma.userProfile.findUnique({
        where: { id }
      })

      if (!existing) {
        throw new Error('Profile setup not found')
      }

      // Prepare update data
      const updateData: any = {}
      
      // Only update provided fields
      if (data.status !== undefined) updateData.status = data.status
      if (data.currentStep !== undefined) updateData.currentStep = data.currentStep
      if (data.completedSteps !== undefined) updateData.completedSteps = data.completedSteps
      if (data.fullName !== undefined) updateData.fullName = data.fullName
      if (data.preferredName !== undefined) updateData.preferredName = data.preferredName
      if (data.location !== undefined) updateData.location = data.location
      if (data.email !== undefined) updateData.email = data.email
      if (data.phone !== undefined) updateData.phone = data.phone
      if (data.disabilityTypes !== undefined) updateData.disabilityTypes = data.disabilityTypes
      if (data.supportNeeds !== undefined) updateData.supportNeeds = data.supportNeeds
      if (data.assistiveTech !== undefined) updateData.assistiveTech = data.assistiveTech
      if (data.accommodations !== undefined) updateData.accommodations = data.accommodations
      if (data.softSkills !== undefined) updateData.softSkills = data.softSkills
      if (data.hardSkills !== undefined) updateData.hardSkills = data.hardSkills
      if (data.industries !== undefined) updateData.industries = data.industries
      if (data.workArrangement !== undefined) updateData.workArrangement = data.workArrangement
      if (data.education !== undefined) updateData.education = data.education
      if (data.experience !== undefined) updateData.experience = data.experience
      if (data.resumeUrl !== undefined) updateData.resumeUrl = data.resumeUrl
      if (data.certificationUrls !== undefined) updateData.certificationUrls = data.certificationUrls
      if (data.certifications !== undefined) updateData.certifications = data.certifications
      if (data.customSummary !== undefined) updateData.customSummary = data.customSummary
      if (data.additionalInfo !== undefined) updateData.additionalInfo = data.additionalInfo

      // Auto-complete if status is COMPLETED
      if (data.status === 'COMPLETED') {
        updateData.completedAt = new Date()
      }

      const profileSetup = await prisma.userProfile.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      })

      return this.formatResponse(profileSetup)
    } catch (error) {
      console.error('Error updating profile setup:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to update profile setup')
    }
  }

  /**
   * Update profile setup step
   */
  static async updateStep(userId: string, step: number, stepData: any): Promise<ProfileSetupResponse> {
    try {
      const existing = await prisma.userProfile.findUnique({
        where: { userId }
      })

      if (!existing) {
        throw new Error('Profile setup not found')
      }

      // Update completed steps
      const completedSteps = [...existing.completedSteps]
      if (!completedSteps.includes(step)) {
        completedSteps.push(step)
      }

      // Determine new status
      let status = existing.status
      if (completedSteps.length === 6) {
        status = 'COMPLETED'
      } else if (completedSteps.length > 0) {
        status = 'IN_PROGRESS'
      }

      const updateData: UpdateProfileSetup = {
        currentStep: Math.max(step + 1, existing.currentStep),
        completedSteps,
        status,
        ...stepData
      }

      return this.update(existing.id, updateData)
    } catch (error) {
      console.error('Error updating profile setup step:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to update profile setup step')
    }
  }

  /**
   * Delete profile setup
   */
  static async delete(id: string): Promise<boolean> {
    try {
      await prisma.userProfile.delete({
        where: { id }
      })
      return true
    } catch (error) {
      console.error('Error deleting profile setup:', error)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('Profile setup not found')
      }
      throw new Error('Failed to delete profile setup')
    }
  }

  /**
   * Get all profile setups with optional filtering
   */
  static async getAll(query: ProfileSetupQuery = {}, page = 1, limit = 10) {
    try {
      const where: Prisma.UserProfileWhereInput = {}
      
      if (query.userId) {
        where.userId = query.userId
      }
      
      if (query.status) {
        where.status = query.status
      }

      if (query.includeCompleted === false) {
        where.status = { not: 'COMPLETED' }
      }

      const [profiles, total] = await prisma.$transaction([
        prisma.userProfile.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { updatedAt: 'desc' }
        }),
        prisma.userProfile.count({ where })
      ])

      return {
        profiles: profiles.map(profile => this.formatResponse(profile)),
        total,
        page,
        limit
      }
    } catch (error) {
      console.error('Error getting all profile setups:', error)
      throw new Error('Failed to retrieve profile setups')
    }
  }

  /**
   * Get profile setup completion statistics
   */
  static async getStats() {
    try {
      const stats = await prisma.userProfile.groupBy({
        by: ['status'],
        _count: true
      })

      const total = await prisma.userProfile.count()

      return {
        total,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat.status] = stat._count
          return acc
        }, {} as Record<string, number>)
      }
    } catch (error) {
      console.error('Error getting profile setup stats:', error)
      throw new Error('Failed to retrieve profile setup statistics')
    }
  }

  /**
   * Format the response to match the schema
   */
  private static formatResponse(profileSetup: any): ProfileSetupResponse {
    return {
      id: profileSetup.id,
      userId: profileSetup.userId,
      status: profileSetup.status,
      currentStep: profileSetup.currentStep,
      completedSteps: profileSetup.completedSteps,
      fullName: profileSetup.fullName,
      preferredName: profileSetup.preferredName,
      location: profileSetup.location,
      email: profileSetup.email,
      phone: profileSetup.phone,
      disabilityTypes: profileSetup.disabilityTypes,
      supportNeeds: profileSetup.supportNeeds,
      assistiveTech: profileSetup.assistiveTech,
      accommodations: profileSetup.accommodations,
      softSkills: profileSetup.softSkills,
      hardSkills: profileSetup.hardSkills,
      industries: profileSetup.industries,
      workArrangement: profileSetup.workArrangement,
      education: profileSetup.education,
      experience: profileSetup.experience,
      resumeUrl: profileSetup.resumeUrl,
      certifications: profileSetup.certifications,
      customSummary: profileSetup.customSummary,
      additionalInfo: profileSetup.additionalInfo,
      createdAt: profileSetup.createdAt,
      updatedAt: profileSetup.updatedAt,
      completedAt: profileSetup.completedAt,
    }
  }
}
