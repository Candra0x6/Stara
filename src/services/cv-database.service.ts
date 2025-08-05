import { PrismaClient, CVSectionType, CVFileType, CVFileStatus } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schemas
const PersonalInfoSchema = z.object({
  name: z.string(),
  email: z.string().optional().or(z.literal('')),
  phone: z.string(),
  location: z.string(),
  summary: z.string(),
})

const ExperienceSchema = z.object({
  company: z.string(),
  position: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: z.string(),
})

const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  year: z.string(),
  gpa: z.string().optional(),
})

const CVDataSchema = z.object({
  personalInfo: PersonalInfoSchema,
  experience: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(z.string()),
  languages: z.array(z.string()),
  certifications: z.array(z.string()),
})

export type CVData = z.infer<typeof CVDataSchema>
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>
export type Experience = z.infer<typeof ExperienceSchema>
export type Education = z.infer<typeof EducationSchema>

export interface CVFileWithSections {
  id: string
  name: string
  slug: string
  data: CVData
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
  isTemplate: boolean
  version: number
  status: string
  templateId?: string
  sections: Array<{
    id: string
    type: string
    title: string
    content: any
    order: number
    isVisible: boolean
  }>
}

export class CVDatabaseService {
  // Get all CV files for a user
  async getUserCVFiles(userId: string): Promise<CVFileWithSections[]> {
    try {
      const cvFiles = await prisma.cVFile.findMany({
        where: { userId, isActive: true },
        include: {
          sections: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { updatedAt: 'desc' }
      })

      return cvFiles.map(file => ({
        id: file.id,
        name: file.name,
        slug: file.slug,
        data: this.sectionsToData(file.sections),
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        isPublic: file.isPublic,
        isTemplate: file.isTemplate,
        version: file.version,
        status: file.status,
        sections: file.sections.map(section => ({
          id: section.id,
          type: section.type,
          title: section.title,
          content: section.content,
          order: section.order,
          isVisible: section.isVisible
        }))
      }))
    } catch (error) {
      console.error('Error fetching CV files:', error)
      throw new Error('Failed to fetch CV files')
    }
  }

  // Get a specific CV file
  async getCVFile(id: string, userId: string): Promise<CVFileWithSections | null> {
    try {
      const cvFile = await prisma.cVFile.findFirst({
        where: { 
          id, 
          userId,
          isActive: true
        },
        include: {
          sections: {
            orderBy: { order: 'asc' }
          }
        }
      })

      if (!cvFile) return null

      return {
        id: cvFile.id,
        name: cvFile.name,
        slug: cvFile.slug,
        data: this.sectionsToData(cvFile.sections),
        createdAt: cvFile.createdAt,
        updatedAt: cvFile.updatedAt,
        isPublic: cvFile.isPublic,
        isTemplate: cvFile.isTemplate,
        version: cvFile.version,
        status: cvFile.status,
        sections: cvFile.sections.map(section => ({
          id: section.id,
          type: section.type,
          title: section.title,
          content: section.content,
          order: section.order,
          isVisible: section.isVisible
        }))
      }
    } catch (error) {
      console.error('Error fetching CV file:', error)
      throw new Error('Failed to fetch CV file')
    }
  }

  // Create a new CV file
  async createCVFile(
    userId: string, 
    name: string, 
    data: CVData, 
    templateId?: string
  ): Promise<CVFileWithSections> {
    try {
      // Validate CV data with more lenient email validation
      const processedData = {
        ...data,
        personalInfo: {
          ...data.personalInfo,
          email: data.personalInfo.email || ''
        }
      }
      const validatedData = CVDataSchema.parse(processedData)

      // Generate unique slug
      const slug = this.generateSlug(name)

      const cvFile = await prisma.cVFile.create({
        data: {
          name,
          slug,
          userId,
          type: CVFileType.RESUME,
          status: CVFileStatus.DRAFT,
          version: 1,
          isPublic: false,
          isTemplate: false,
          sections: {
            create: this.createDefaultSections(validatedData)
          }
        },
        include: {
          sections: {
            orderBy: { order: 'asc' }
          }
        }
      })

      return {
        id: cvFile.id,
        name: cvFile.name,
        slug: cvFile.slug,
        data: this.sectionsToData(cvFile.sections),
        createdAt: cvFile.createdAt,
        updatedAt: cvFile.updatedAt,
        isPublic: cvFile.isPublic,
        isTemplate: cvFile.isTemplate,
        version: cvFile.version,
        status: cvFile.status,
        sections: cvFile.sections.map(section => ({
          id: section.id,
          type: section.type,
          title: section.title,
          content: section.content,
          order: section.order,
          isVisible: section.isVisible
        }))
      }
    } catch (error) {
      console.error('Error creating CV file:', error)
      throw new Error('Failed to create CV file')
    }
  }

  // Update an existing CV file
  async updateCVFile(
    id: string, 
    userId: string, 
    updates: Partial<{ name: string; data: CVData; isPublic: boolean }>
  ): Promise<CVFileWithSections> {
    try {
      // Validate data if provided
      if (updates.data) {
        const processedData = {
          ...updates.data,
          personalInfo: {
            ...updates.data.personalInfo,
            email: updates.data.personalInfo.email || ''
          }
        }
        updates.data = CVDataSchema.parse(processedData)
      }

      const cvFile = await prisma.cVFile.update({
        where: { 
          id,
          userId 
        },
        data: {
          name: updates.name,
          isPublic: updates.isPublic,
          updatedAt: new Date(),
          lastEditedAt: new Date()
        },
        include: {
          sections: {
            orderBy: { order: 'asc' }
          }
        }
      })

      // Update sections if data changed
      if (updates.data) {
        await this.updateCVSections(id, updates.data)
      }

      const updatedFile = await this.getCVFile(id, userId)
      if (!updatedFile) {
        throw new Error('CV file not found after update')
      }

      return updatedFile
    } catch (error) {
      console.error('Error updating CV file:', error)
      throw new Error('Failed to update CV file')
    }
  }

  // Delete a CV file
  async deleteCVFile(id: string, userId: string): Promise<boolean> {
    try {
      await prisma.cVFile.update({
        where: { 
          id,
          userId 
        },
        data: {
          isActive: false,
          status: CVFileStatus.DELETED
        }
      })
      return true
    } catch (error) {
      console.error('Error deleting CV file:', error)
      return false
    }
  }

  // Duplicate a CV file
  async duplicateCVFile(
    id: string, 
    userId: string, 
    newName: string
  ): Promise<CVFileWithSections> {
    try {
      const originalFile = await this.getCVFile(id, userId)
      if (!originalFile) {
        throw new Error('Original CV file not found')
      }

      return await this.createCVFile(
        userId,
        newName,
        originalFile.data
      )
    } catch (error) {
      console.error('Error duplicating CV file:', error)
      throw new Error('Failed to duplicate CV file')
    }
  }

  // Create a new version of a CV file
  async createCVVersion(
    cvFileId: string,
    userId: string,
    versionName: string,
    changes: string
  ): Promise<void> {
    try {
      const cvFile = await prisma.cVFile.findFirst({
        where: { id: cvFileId, userId },
        include: { sections: true }
      })

      if (!cvFile) {
        throw new Error('CV file not found')
      }

      await prisma.cVVersion.create({
        data: {
          cvFileId,
          version: cvFile.version + 1,
          title: versionName,
          description: changes,
          sectionsData: cvFile.sections,
          createdBy: userId
        }
      })

      // Update file version number
      await prisma.cVFile.update({
        where: { id: cvFileId },
        data: { version: cvFile.version + 1 }
      })
    } catch (error) {
      console.error('Error creating CV version:', error)
      throw new Error('Failed to create CV version')
    }
  }

  // Share a CV file
  async shareCVFile(
    cvFileId: string,
    userId: string,
    shareWithEmail: string,
    permissions: 'VIEW' | 'EDIT' = 'VIEW'
  ): Promise<string> {
    try {
      const shareToken = this.generateShareToken()
      
      await prisma.cVShare.create({
        data: {
          cvFileId,
          shareToken,
          shareType: permissions as any,
          allowDownload: permissions === 'VIEW',
          allowComments: permissions === 'EDIT'
        }
      })

      return shareToken
    } catch (error) {
      console.error('Error sharing CV file:', error)
      throw new Error('Failed to share CV file')
    }
  }

  // Get shared CV file by token
  async getSharedCVFile(shareToken: string): Promise<CVFileWithSections | null> {
    try {
      const share = await prisma.cVShare.findFirst({
        where: { 
          shareToken
        },
        include: {
          cvFile: {
            include: {
              sections: {
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      })

      if (!share || !share.cvFile) return null

      const cvFile = share.cvFile
      return {
        id: cvFile.id,
        name: cvFile.name,
        slug: cvFile.slug,
        data: this.sectionsToData(cvFile.sections),
        createdAt: cvFile.createdAt,
        updatedAt: cvFile.updatedAt,
        isPublic: cvFile.isPublic,
        isTemplate: cvFile.isTemplate,
        version: cvFile.version,
        status: cvFile.status,
        sections: cvFile.sections.map(section => ({
          id: section.id,
          type: section.type,
          title: section.title,
          content: section.content,
          order: section.order,
          isVisible: section.isVisible
        }))
      }
    } catch (error) {
      console.error('Error fetching shared CV file:', error)
      throw new Error('Failed to fetch shared CV file')
    }
  }

  // Helper methods
  private sectionsToData(sections: any[]): CVData {
    const data: CVData = this.getDefaultCVData()
    
    sections.forEach(section => {
      switch (section.type) {
        case CVSectionType.PERSONAL_INFO:
          data.personalInfo = section.content as PersonalInfo
          break
        case CVSectionType.EXPERIENCE:
          data.experience = section.content as Experience[]
          break
        case CVSectionType.EDUCATION:
          data.education = section.content as Education[]
          break
        case CVSectionType.SKILLS:
          data.skills = section.content as string[]
          break
        case CVSectionType.LANGUAGES:
          data.languages = section.content as string[]
          break
        case CVSectionType.CERTIFICATIONS:
          data.certifications = section.content as string[]
          break
      }
    })
    
    return data
  }

  private getDefaultCVData(): CVData {
    return {
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        location: '',
        summary: ''
      },
      experience: [],
      education: [],
      skills: [],
      languages: [],
      certifications: []
    }
  }

  private createDefaultSections(data: CVData) {
    return [
      {
        type: CVSectionType.PERSONAL_INFO,
        title: 'Personal Information',
        content: data.personalInfo,
        order: 1,
        isVisible: true
      },
      {
        type: CVSectionType.EXPERIENCE,
        title: 'Work Experience',
        content: data.experience,
        order: 2,
        isVisible: true
      },
      {
        type: CVSectionType.EDUCATION,
        title: 'Education',
        content: data.education,
        order: 3,
        isVisible: true
      },
      {
        type: CVSectionType.SKILLS,
        title: 'Skills',
        content: data.skills,
        order: 4,
        isVisible: true
      },
      {
        type: CVSectionType.LANGUAGES,
        title: 'Languages',
        content: data.languages,
        order: 5,
        isVisible: true
      },
      {
        type: CVSectionType.CERTIFICATIONS,
        title: 'Certifications',
        content: data.certifications,
        order: 6,
        isVisible: true
      }
    ]
  }

  private async updateCVSections(cvFileId: string, data: CVData) {
    // Delete existing sections
    await prisma.cVSection.deleteMany({
      where: { cvFileId }
    })

    // Create new sections
    await prisma.cVSection.createMany({
      data: this.createDefaultSections(data).map(section => ({
        ...section,
        cvFileId
      }))
    })
  }

  private generateSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    return `${baseSlug}-${Date.now()}`
  }

  private generateShareToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }
}

// Export singleton instance
export const cvDatabaseService = new CVDatabaseService()
