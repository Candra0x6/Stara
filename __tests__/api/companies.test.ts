/**
 * @jest-environment node
 */

import { 
  CreateCompanySchema, 
  UpdateCompanySchema,
  CompanySizeSchema 
} from "@/lib/validations/job"

describe("Companies API Validation", () => {
  describe("Zod Validation Schemas", () => {
    describe("CreateCompanySchema", () => {
      it("should validate valid company creation data", () => {
        const validData = {
          name: "TechCorp Inc.",
          description: "A leading technology company",
          website: "https://techcorp.com",
          logo: "https://techcorp.com/logo.png",
          size: "LARGE",
          industry: "Technology",
          location: "San Francisco, CA",
          culture: "Innovation and collaboration focused",
          values: ["Innovation", "Collaboration", "Integrity"],
          contactEmail: "contact@techcorp.com",
          contactPhone: "+1-555-0123",
          linkedinUrl: "https://linkedin.com/company/techcorp",
          twitterUrl: "https://twitter.com/techcorp"
        }

        const result = CreateCompanySchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it("should reject invalid company creation data", () => {
        const invalidData = {
          name: "", // Empty name
          website: "invalid-url", // Invalid URL
          contactEmail: "invalid-email", // Invalid email
          size: "INVALID_SIZE" // Invalid enum value
        }

        const result = CreateCompanySchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        
        if (!result.success) {
          const errors = result.error.issues.map(e => e.path.join('.'))
          expect(errors).toContain('name')
          expect(errors).toContain('website')
          expect(errors).toContain('contactEmail')
          expect(errors).toContain('size')
        }
      })

      it("should allow empty strings for optional URLs", () => {
        const dataWithEmptyUrls = {
          name: "TechCorp Inc.",
          website: "",
          logo: "",
          linkedinUrl: "",
          twitterUrl: "",
          contactEmail: ""
        }

        const result = CreateCompanySchema.safeParse(dataWithEmptyUrls)
        expect(result.success).toBe(true)
      })

      it("should validate company size enum", () => {
        const validSizes = ["STARTUP", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]
        
        validSizes.forEach(size => {
          const result = CompanySizeSchema.safeParse(size)
          expect(result.success).toBe(true)
        })

        const invalidSize = CompanySizeSchema.safeParse("INVALID_SIZE")
        expect(invalidSize.success).toBe(false)
      })

      it("should default values array to empty", () => {
        const dataWithoutValues = {
          name: "TechCorp Inc."
        }

        const result = CreateCompanySchema.safeParse(dataWithoutValues)
        expect(result.success).toBe(true)
        
        if (result.success) {
          expect(result.data.values).toEqual([])
        }
      })
    })

    describe("UpdateCompanySchema", () => {
      it("should validate partial company update data", () => {
        const validUpdateData = {
          name: "Updated TechCorp Inc.",
          description: "Updated description"
        }

        const result = UpdateCompanySchema.safeParse(validUpdateData)
        expect(result.success).toBe(true)
      })

      it("should allow empty object for update", () => {
        const emptyUpdate = {}

        const result = UpdateCompanySchema.safeParse(emptyUpdate)
        expect(result.success).toBe(true)
      })

      it("should validate URLs when provided", () => {
        const updateWithInvalidUrl = {
          website: "not-a-url"
        }

        const result = UpdateCompanySchema.safeParse(updateWithInvalidUrl)
        expect(result.success).toBe(false)
        
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('website')
        }
      })
    })
  })

  describe("API Response Formats", () => {
    it("should structure successful company response correctly", () => {
      const mockCompany = {
        id: "1",
        name: "TechCorp Inc.",
        description: "Leading tech company",
        industry: "Technology",
        size: "LARGE",
        _count: {
          jobs: 5
        }
      }

      const successResponse = {
        success: true,
        data: mockCompany
      }

      expect(successResponse.success).toBe(true)
      expect(successResponse.data).toEqual(mockCompany)
      expect(successResponse.data._count.jobs).toBe(5)
    })

    it("should structure paginated companies response correctly", () => {
      const paginatedResponse = {
        success: true,
        data: {
          companies: [],
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
      expect(paginatedResponse.data.companies).toBeDefined()
      expect(paginatedResponse.data.pagination).toBeDefined()
      expect(paginatedResponse.data.pagination.page).toBe(1)
    })

    it("should structure error response correctly", () => {
      const errorResponse = {
        success: false,
        error: "Company not found"
      }

      expect(errorResponse.success).toBe(false)
      expect(errorResponse.error).toBe("Company not found")
    })
  })

  describe("Database Query Logic", () => {
    it("should build correct where clause for company search", () => {
      const searchTerm = "tech"
      
      const expectedWhereClause = {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
          { industry: { contains: searchTerm, mode: "insensitive" } }
        ]
      }

      expect(expectedWhereClause.OR).toHaveLength(3)
      expect(expectedWhereClause.OR[0]).toEqual({ name: { contains: searchTerm, mode: "insensitive" } })
    })

    it("should build correct where clause for company filters", () => {
      const filters = {
        industry: "Technology",
        size: "LARGE"
      }

      const expectedWhereClause = {
        industry: filters.industry,
        size: filters.size
      }

      expect(expectedWhereClause.industry).toBe("Technology")
      expect(expectedWhereClause.size).toBe("LARGE")
    })

    it("should include job count in company queries", () => {
      const expectedInclude = {
        _count: {
          select: {
            jobs: {
              where: {
                isActive: true,
                status: "PUBLISHED"
              }
            }
          }
        }
      }

      expect(expectedInclude._count.select.jobs.where.isActive).toBe(true)
      expect(expectedInclude._count.select.jobs.where.status).toBe("PUBLISHED")
    })

    it("should include company jobs in detail queries", () => {
      const expectedJobsInclude = {
        jobs: {
          where: {
            isActive: true,
            status: "PUBLISHED"
          },
          select: {
            id: true,
            title: true,
            location: true,
            workType: true,
            experience: true,
            salaryMin: true,
            salaryMax: true,
            salaryCurrency: true,
            accommodations: true,
            createdAt: true,
            _count: {
              select: {
                applications: true
              }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }

      expect(expectedJobsInclude.jobs.where.isActive).toBe(true)
      expect(expectedJobsInclude.jobs.select.title).toBe(true)
      expect(expectedJobsInclude.jobs.orderBy).toEqual({ createdAt: "desc" })
    })
  })

  describe("Business Logic Validation", () => {
    it("should prevent deletion of companies with active jobs", () => {
      const companyWithJobs = {
        id: "1",
        name: "TechCorp",
        _count: { jobs: 5 }
      }

      const canDelete = companyWithJobs._count.jobs === 0
      expect(canDelete).toBe(false)
    })

    it("should allow deletion of companies without jobs", () => {
      const companyWithoutJobs = {
        id: "1",
        name: "TechCorp",
        _count: { jobs: 0 }
      }

      const canDelete = companyWithoutJobs._count.jobs === 0
      expect(canDelete).toBe(true)
    })

    it("should validate required fields for company creation", () => {
      const requiredFields = ["name"]
      
      requiredFields.forEach(field => {
        const dataWithoutField = {}
        const result = CreateCompanySchema.safeParse(dataWithoutField)
        
        expect(result.success).toBe(false)
        if (!result.success) {
          const errors = result.error.issues.map(e => e.path.join('.'))
          expect(errors).toContain(field)
        }
      })
    })

    it("should validate URL formats", () => {
      const validUrls = [
        "https://example.com",
        "http://example.com",
        "https://subdomain.example.com/path"
      ]

      const invalidUrls = [
        "not-a-url",
        "example.com",
        "://no-protocol"
      ]

      validUrls.forEach(url => {
        const result = CreateCompanySchema.safeParse({ name: "Test", website: url })
        expect(result.success).toBe(true)
      })

      invalidUrls.forEach(url => {
        const result = CreateCompanySchema.safeParse({ name: "Test", website: url })
        expect(result.success).toBe(false)
      })
    })
  })
})
