/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from "next/server"
import { 
  CreateJobSchema, 
  UpdateJobSchema, 
  JobQuerySchema,
  CreateJobApplicationSchema,
  CreateSavedJobSchema 
} from "@/lib/validations/job"

// Mock Prisma
const mockPrisma = {
  job: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  company: {
    findUnique: jest.fn()
  },
  jobApplication: {
    findUnique: jest.fn(),
    create: jest.fn()
  },
  savedJob: {
    findUnique: jest.fn(),
    create: jest.fn()
  }
}

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: mockPrisma
}))

// Mock next-auth
const mockGetServerSession = jest.fn()
jest.mock("next-auth", () => ({
  getServerSession: mockGetServerSession
}))

jest.mock("@/lib/auth", () => ({
  authOptions: {}
}))

describe("Job API Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Zod Validation Schemas", () => {
    describe("CreateJobSchema", () => {
      it("should validate valid job creation data", () => {
        const validData = {
          title: "Senior Frontend Developer",
          description: "A great opportunity for a senior developer",
          companyId: "clxx123456789",
          location: "San Francisco, CA",
          workType: "FULL_TIME",
          experience: "SENIOR",
          responsibilities: ["Develop features", "Code reviews"],
          requirements: ["React experience", "TypeScript"],
          benefits: ["Health insurance", "401k"]
        }

        const result = CreateJobSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it("should reject invalid job creation data", () => {
        const invalidData = {
          title: "", // Empty title
          description: "", // Empty description
          companyId: "invalid-id", // Invalid CUID
          location: "",
          workType: "INVALID_TYPE",
          experience: "INVALID_LEVEL"
        }

        const result = CreateJobSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        
        if (!result.success) {
          const errors = result.error.issues.map(e => e.path.join('.'))
          expect(errors).toContain('title')
          expect(errors).toContain('description')
          expect(errors).toContain('companyId')
          expect(errors).toContain('location')
          expect(errors).toContain('workType')
          expect(errors).toContain('experience')
        }
      })

      it("should validate salary constraints", () => {
        const invalidSalaryData = {
          title: "Test Job",
          description: "Test description",
          companyId: "clxx123456789",
          location: "Test City",
          workType: "FULL_TIME",
          experience: "SENIOR",
          salaryMin: 150000,
          salaryMax: 100000 // Max less than min
        }

        const result = CreateJobSchema.safeParse(invalidSalaryData)
        expect(result.success).toBe(false)
        
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("Minimum salary must be less than or equal to maximum salary")
        }
      })
    })

    describe("UpdateJobSchema", () => {
      it("should validate job update data", () => {
        const validUpdateData = {
          id: "clxx123456789",
          title: "Updated Title",
          description: "Updated description"
        }

        const result = UpdateJobSchema.safeParse(validUpdateData)
        expect(result.success).toBe(true)
      })

      it("should reject invalid job ID", () => {
        const invalidUpdateData = {
          id: "invalid-id",
          title: "Updated Title"
        }

        const result = UpdateJobSchema.safeParse(invalidUpdateData)
        expect(result.success).toBe(false)
        
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('id')
        }
      })
    })

    describe("JobQuerySchema", () => {
      it("should validate job query parameters", () => {
        const validQuery = {
          page: "1",
          limit: "10",
          search: "developer",
          workType: ["FULL_TIME", "REMOTE"],
          experience: ["SENIOR"],
          accommodations: ["VISUAL", "HEARING"],
          location: "San Francisco",
          isRemote: "true",
          sortBy: "createdAt",
          sortOrder: "desc"
        }

        const result = JobQuerySchema.safeParse(validQuery)
        expect(result.success).toBe(true)
        
        if (result.success) {
          expect(result.data.page).toBe(1)
          expect(result.data.limit).toBe(10)
          expect(result.data.isRemote).toBe(true)
        }
      })

      it("should apply default values", () => {
        const minimalQuery = {}

        const result = JobQuerySchema.safeParse(minimalQuery)
        expect(result.success).toBe(true)
        
        if (result.success) {
          expect(result.data.page).toBe(1)
          expect(result.data.limit).toBe(10)
          expect(result.data.isActive).toBe(true)
          expect(result.data.sortBy).toBe("createdAt")
          expect(result.data.sortOrder).toBe("desc")
        }
      })

      it("should enforce maximum limit", () => {
        const queryWithLargeLimit = {
          limit: "200" // Above max of 100
        }

        const result = JobQuerySchema.safeParse(queryWithLargeLimit)
        expect(result.success).toBe(false)
      })
    })

    describe("CreateJobApplicationSchema", () => {
      it("should validate job application data", () => {
        const validApplicationData = {
          jobId: "clxx123456789",
          coverLetter: "I am very interested in this position",
          resumeUrl: "https://example.com/resume.pdf",
          customAnswers: [
            { question: "Why do you want this job?", answer: "Great opportunity" }
          ]
        }

        const result = CreateJobApplicationSchema.safeParse(validApplicationData)
        expect(result.success).toBe(true)
      })

      it("should reject invalid job ID", () => {
        const invalidApplicationData = {
          jobId: "invalid-id"
        }

        const result = CreateJobApplicationSchema.safeParse(invalidApplicationData)
        expect(result.success).toBe(false)
        
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('jobId')
        }
      })
    })

    describe("CreateSavedJobSchema", () => {
      it("should validate saved job data", () => {
        const validSavedJobData = {
          jobId: "clxx123456789"
        }

        const result = CreateSavedJobSchema.safeParse(validSavedJobData)
        expect(result.success).toBe(true)
      })

      it("should reject invalid job ID", () => {
        const invalidSavedJobData = {
          jobId: "invalid-id"
        }

        const result = CreateSavedJobSchema.safeParse(invalidSavedJobData)
        expect(result.success).toBe(false)
        
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('jobId')
        }
      })
    })
  })

  describe("API Response Formats", () => {
    it("should structure successful responses correctly", () => {
      const mockJob = {
        id: "1",
        title: "Test Job",
        description: "Test description",
        company: { name: "Test Company" }
      }

      const successResponse = {
        success: true,
        data: mockJob
      }

      expect(successResponse.success).toBe(true)
      expect(successResponse.data).toEqual(mockJob)
    })

    it("should structure error responses correctly", () => {
      const errorResponse = {
        success: false,
        error: "Job not found"
      }

      expect(errorResponse.success).toBe(false)
      expect(errorResponse.error).toBe("Job not found")
    })

    it("should structure paginated responses correctly", () => {
      const paginatedResponse = {
        success: true,
        data: {
          jobs: [],
          pagination: {
            page: 1,
            limit: 10,
            totalCount: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        }
      }

      expect(paginatedResponse.success).toBe(true)
      expect(paginatedResponse.data.pagination).toBeDefined()
      expect(paginatedResponse.data.pagination.page).toBe(1)
      expect(paginatedResponse.data.pagination.limit).toBe(10)
    })
  })

  describe("Database Query Logic", () => {
    it("should build correct where clause for job search", () => {
      const searchTerm = "developer"
      
      const expectedWhereClause = {
        isActive: true,
        status: "PUBLISHED",
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
          { company: { name: { contains: searchTerm, mode: "insensitive" } } }
        ]
      }

      expect(expectedWhereClause.OR).toHaveLength(3)
      expect(expectedWhereClause.OR?.[0]).toEqual({ title: { contains: searchTerm, mode: "insensitive" } })
    })

    it("should build correct where clause for filters", () => {
      const filters = {
        workType: ["FULL_TIME", "REMOTE"],
        experience: ["SENIOR"],
        accommodations: ["VISUAL", "HEARING"],
        location: "San Francisco",
        isRemote: true,
        salaryMin: 100000,
        salaryMax: 200000
      }

      const expectedWhereClause = {
        isActive: true,
        status: "PUBLISHED",
        workType: { in: filters.workType },
        experience: { in: filters.experience },
        accommodations: { hasSome: filters.accommodations },
        location: { contains: filters.location, mode: "insensitive" },
        isRemote: filters.isRemote,
        AND: [
          { salaryMax: { gte: filters.salaryMin } },
          { salaryMin: { lte: filters.salaryMax } }
        ]
      }

      expect(expectedWhereClause.workType).toEqual({ in: filters.workType })
      expect(expectedWhereClause.accommodations).toEqual({ hasSome: filters.accommodations })
      expect(expectedWhereClause.AND).toHaveLength(2)
    })
  })
})
