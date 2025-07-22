import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { ProfileSetupService } from '@/lib/services/profile.service'
import { CreateProfileSetup, UpdateProfileSetup } from '@/lib/validations/profile'
import prisma from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  profileSetup: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('ProfileSetupService', () => {
  const mockUserId = 'user_123'
  const mockProfileSetupId = 'profile_123'
  
  const mockUser = {
    id: mockUserId,
    name: 'Test User',
    email: 'test@example.com',
    role: 'JOB_SEEKER'
  }

  const mockProfileSetupData: CreateProfileSetup = {
    userId: mockUserId,
    status: 'IN_PROGRESS',
    currentStep: 1,
    completedSteps: [1],
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
    location: 'Test City',
    disabilityTypes: ['Visual Impairment'],
    softSkills: ['Communication'],
    hardSkills: ['Programming'],
    industries: ['Technology'],
    workArrangement: 'Remote',
  }

  const mockProfileSetupResponse = {
    id: mockProfileSetupId,
    ...mockProfileSetupData,
    disabilityTypes: ['Visual Impairment'],
    assistiveTech: [],
    softSkills: ['Communication'],
    hardSkills: ['Programming'],
    industries: ['Technology'],
    education: [],
    experience: [],
    certifications: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
    user: mockUser,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getByUserId', () => {
    it('should return profile setup for valid user ID', async () => {
      mockPrisma.profileSetup.findUnique.mockResolvedValue(mockProfileSetupResponse)

      const result = await ProfileSetupService.getByUserId(mockUserId)

      expect(mockPrisma.profileSetup.findUnique).toHaveBeenCalledWith({
        where: { userId: mockUserId },
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
      expect(result).toBeDefined()
      expect(result?.userId).toBe(mockUserId)
    })

    it('should return null for non-existent user', async () => {
      mockPrisma.profileSetup.findUnique.mockResolvedValue(null)

      const result = await ProfileSetupService.getByUserId('non_existent_user')

      expect(result).toBeNull()
    })

    it('should throw error when database fails', async () => {
      mockPrisma.profileSetup.findUnique.mockRejectedValue(new Error('Database error'))

      await expect(ProfileSetupService.getByUserId(mockUserId))
        .rejects.toThrow('Failed to retrieve profile setup')
    })
  })

  describe('getById', () => {
    it('should return profile setup for valid ID', async () => {
      mockPrisma.profileSetup.findUnique.mockResolvedValue(mockProfileSetupResponse)

      const result = await ProfileSetupService.getById(mockProfileSetupId)

      expect(mockPrisma.profileSetup.findUnique).toHaveBeenCalledWith({
        where: { id: mockProfileSetupId },
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
      expect(result).toBeDefined()
      expect(result?.id).toBe(mockProfileSetupId)
    })

    it('should return null for non-existent profile setup', async () => {
      mockPrisma.profileSetup.findUnique.mockResolvedValue(null)

      const result = await ProfileSetupService.getById('non_existent_id')

      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    beforeEach(() => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.profileSetup.findUnique.mockResolvedValue(null) // No existing profile
      mockPrisma.profileSetup.create.mockResolvedValue(mockProfileSetupResponse)
    })

    it('should create new profile setup successfully', async () => {
      const result = await ProfileSetupService.create(mockProfileSetupData)

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId }
      })
      expect(mockPrisma.profileSetup.findUnique).toHaveBeenCalledWith({
        where: { userId: mockUserId }
      })
      expect(mockPrisma.profileSetup.create).toHaveBeenCalled()
      expect(result).toBeDefined()
      expect(result.userId).toBe(mockUserId)
    })

    it('should throw error if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(ProfileSetupService.create(mockProfileSetupData))
        .rejects.toThrow('User not found')
    })

    it('should throw error if profile setup already exists', async () => {
      mockPrisma.profileSetup.findUnique.mockResolvedValue(mockProfileSetupResponse)

      await expect(ProfileSetupService.create(mockProfileSetupData))
        .rejects.toThrow('Profile setup already exists for this user')
    })
  })

  describe('update', () => {
    const updateData: UpdateProfileSetup = {
      fullName: 'Updated Name',
      currentStep: 2,
      status: 'IN_PROGRESS'
    }

    beforeEach(() => {
      mockPrisma.profileSetup.findUnique.mockResolvedValue(mockProfileSetupResponse)
      mockPrisma.profileSetup.update.mockResolvedValue({
        ...mockProfileSetupResponse,
        ...updateData
      })
    })

    it('should update profile setup successfully', async () => {
      const result = await ProfileSetupService.update(mockProfileSetupId, updateData)

      expect(mockPrisma.profileSetup.findUnique).toHaveBeenCalledWith({
        where: { id: mockProfileSetupId }
      })
      expect(mockPrisma.profileSetup.update).toHaveBeenCalled()
      expect(result).toBeDefined()
      expect(result.fullName).toBe(updateData.fullName)
    })

    it('should throw error if profile setup does not exist', async () => {
      mockPrisma.profileSetup.findUnique.mockResolvedValue(null)

      await expect(ProfileSetupService.update(mockProfileSetupId, updateData))
        .rejects.toThrow('Profile setup not found')
    })

    it('should set completedAt when status is COMPLETED', async () => {
      const completedData: UpdateProfileSetup = {
        status: 'COMPLETED'
      }

      await ProfileSetupService.update(mockProfileSetupId, completedData)

      expect(mockPrisma.profileSetup.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            completedAt: expect.any(Date)
          })
        })
      )
    })
  })

  describe('updateStep', () => {
    const stepData = {
      fullName: 'Updated Name',
      email: 'updated@example.com'
    }

    beforeEach(() => {
      mockPrisma.profileSetup.findUnique.mockResolvedValue(mockProfileSetupResponse)
      // Mock the update method to be called by updateStep
      jest.spyOn(ProfileSetupService, 'update').mockResolvedValue({
        ...mockProfileSetupResponse,
        currentStep: 2,
        completedSteps: [1, 2],
        status: 'IN_PROGRESS'
      })
    })

    it('should update step and progress tracking', async () => {
      const result = await ProfileSetupService.updateStep(mockUserId, 1, stepData)

      expect(mockPrisma.profileSetup.findUnique).toHaveBeenCalledWith({
        where: { userId: mockUserId }
      })
      expect(ProfileSetupService.update).toHaveBeenCalled()
      expect(result.currentStep).toBe(2)
      expect(result.completedSteps).toContain(1)
    })

    it('should throw error if profile setup does not exist', async () => {
      mockPrisma.profileSetup.findUnique.mockResolvedValue(null)

      await expect(ProfileSetupService.updateStep(mockUserId, 1, stepData))
        .rejects.toThrow('Profile setup not found')
    })

    it('should mark as completed when all steps are done', async () => {
      const completedProfileSetup = {
        ...mockProfileSetupResponse,
        completedSteps: [1, 2, 3, 4, 5] // Missing step 6
      }
      mockPrisma.profileSetup.findUnique.mockResolvedValue(completedProfileSetup)
      
      jest.spyOn(ProfileSetupService, 'update').mockResolvedValue({
        ...completedProfileSetup,
        completedSteps: [1, 2, 3, 4, 5, 6],
        status: 'COMPLETED'
      })

      const result = await ProfileSetupService.updateStep(mockUserId, 6, stepData)

      expect(result.status).toBe('COMPLETED')
      expect(result.completedSteps).toHaveLength(6)
    })
  })

  describe('delete', () => {
    it('should delete profile setup successfully', async () => {
      mockPrisma.profileSetup.delete.mockResolvedValue(mockProfileSetupResponse)

      const result = await ProfileSetupService.delete(mockProfileSetupId)

      expect(mockPrisma.profileSetup.delete).toHaveBeenCalledWith({
        where: { id: mockProfileSetupId }
      })
      expect(result).toBe(true)
    })

    it('should throw error if profile setup does not exist', async () => {
      const prismaError = new Error('Record not found')
      ;(prismaError as any).code = 'P2025'
      mockPrisma.profileSetup.delete.mockRejectedValue(prismaError)

      await expect(ProfileSetupService.delete('non_existent_id'))
        .rejects.toThrow('Profile setup not found')
    })
  })

  describe('getAll', () => {
    const mockProfiles = [mockProfileSetupResponse]
    const mockTotal = 1

    beforeEach(() => {
      mockPrisma.$transaction.mockResolvedValue([mockProfiles, mockTotal])
    })

    it('should return paginated list of profile setups', async () => {
      const result = await ProfileSetupService.getAll({}, 1, 10)

      expect(mockPrisma.$transaction).toHaveBeenCalled()
      expect(result.profiles).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
    })

    it('should filter by status when provided', async () => {
      await ProfileSetupService.getAll({ status: 'COMPLETED' }, 1, 10)

      expect(mockPrisma.$transaction).toHaveBeenCalledWith([
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'COMPLETED'
          })
        }),
        expect.any(Object)
      ])
    })

    it('should filter by userId when provided', async () => {
      await ProfileSetupService.getAll({ userId: mockUserId }, 1, 10)

      expect(mockPrisma.$transaction).toHaveBeenCalledWith([
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUserId
          })
        }),
        expect.any(Object)
      ])
    })
  })

  describe('getStats', () => {
    const mockStats = [
      { status: 'COMPLETED', _count: 5 },
      { status: 'IN_PROGRESS', _count: 3 },
      { status: 'NOT_STARTED', _count: 2 }
    ]
    const mockTotal = 10

    beforeEach(() => {
      mockPrisma.profileSetup.groupBy.mockResolvedValue(mockStats)
      mockPrisma.profileSetup.count.mockResolvedValue(mockTotal)
    })

    it('should return profile setup statistics', async () => {
      const result = await ProfileSetupService.getStats()

      expect(mockPrisma.profileSetup.groupBy).toHaveBeenCalledWith({
        by: ['status'],
        _count: true
      })
      expect(mockPrisma.profileSetup.count).toHaveBeenCalled()
      expect(result.total).toBe(10)
      expect(result.byStatus).toEqual({
        'COMPLETED': 5,
        'IN_PROGRESS': 3,
        'NOT_STARTED': 2
      })
    })
  })
})
