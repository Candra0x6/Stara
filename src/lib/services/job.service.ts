import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import {
  CreateJobRequest,
  UpdateJobRequest,
  JobQueryRequest
} from "@/lib/validations/job"

export class JobService {
  /**
   * Get jobs with filtering and pagination
   */
  static async getJobs(query: JobQueryRequest) {
    const {
      page,
      limit,
      search,
      workType,
      experience,
      accommodations,
      location,
      companyId,
      salaryMin,
      salaryMax,
      isRemote,
      isActive,
      sortBy,
      sortOrder
    } = query

    // Build where clause
    const where: Prisma.JobWhereInput = {
      isActive,
      status: "PUBLISHED"
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { company: { name: { contains: search, mode: "insensitive" } } }
      ]
    }

    if (workType && workType.length > 0) {
      where.workType = { in: workType }
    }

    if (experience && experience.length > 0) {
      where.experience = { in: experience }
    }

    if (accommodations && accommodations.length > 0) {
      where.accommodations = {
        hasSome: accommodations
      }
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" }
    }

    if (companyId) {
      where.companyId = companyId
    }

    if (salaryMin || salaryMax) {
      where.AND = []
      if (salaryMin) {
        where.AND.push({ salaryMax: { gte: salaryMin } })
      }
      if (salaryMax) {
        where.AND.push({ salaryMin: { lte: salaryMax } })
      }
    }

    if (isRemote !== undefined) {
      where.isRemote = isRemote
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build order by clause
    const orderBy: Prisma.JobOrderByWithRelationInput = {}
    if (sortBy === "title") {
      orderBy.title = sortOrder
    } else if (sortBy === "salaryMin") {
      orderBy.salaryMin = sortOrder
    } else if (sortBy === "salaryMax") {
      orderBy.salaryMax = sortOrder
    } else {
      orderBy[sortBy] = sortOrder
    }

    // Execute queries
    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              size: true,
              industry: true,
              location: true
            }
          },
          _count: {
            select: {
              applications: true,
              savedJobs: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.job.count({ where })
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return {
      jobs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrev
      }
    }
  }

  /**
   * Get job by ID with full details
   */
  static async getJobById(id: string) {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            description: true,
            logo: true,
            size: true,
            industry: true,
            location: true,
            culture: true,
            values: true,
            website: true,
            linkedinUrl: true,
            twitterUrl: true
          }
        },
        _count: {
          select: {
            applications: true,
            savedJobs: true
          }
        }
      }
    })

    if (job) {
      // Increment view count
      await prisma.job.update({
        where: { id },
        data: { viewCount: { increment: 1 } }
      })
    }

    return job
  }

  /**
   * Create a new job
   */
  static async createJob(data: CreateJobRequest) {
    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: data.companyId }
    })

    if (!company) {
      throw new Error("Company not found")
    }

    // Generate slug from title
    const baseSlug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const slug = await this.generateUniqueSlug(baseSlug)

    const job = await prisma.job.create({
      data: {
        ...data,
        slug,
        applicationDeadline: data.applicationDeadline 
          ? new Date(data.applicationDeadline)
          : undefined
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            size: true,
            industry: true,
            location: true
          }
        }
      }
    })

    return job
  }

  /**
   * Update an existing job
   */
  static async updateJob(id: string, data: Partial<UpdateJobRequest>) {
    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id },
      include: { company: true }
    })

    if (!existingJob) {
      throw new Error("Job not found")
    }

    const job = await prisma.job.update({
      where: { id },
      data: {
        ...data,
        applicationDeadline: data.applicationDeadline 
          ? new Date(data.applicationDeadline)
          : undefined,
        updatedAt: new Date()
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            size: true,
            industry: true,
            location: true
          }
        }
      }
    })

    return job
  }

  /**
   * Delete a job
   */
  static async deleteJob(id: string) {
    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id }
    })

    if (!existingJob) {
      throw new Error("Job not found")
    }

    await prisma.job.delete({
      where: { id }
    })

    return { message: "Job deleted successfully" }
  }

  /**
   * Generate unique slug for job
   */
  private static async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug
    let counter = 1

    while (true) {
      const existingJob = await prisma.job.findUnique({
        where: { slug }
      })

      if (!existingJob) {
        return slug
      }

      slug = `${baseSlug}-${counter}`
      counter++
    }
  }

  /**
   * Get job statistics
   */
  static async getJobStats() {
    const [
      totalJobs,
      activeJobs,
      totalApplications,
      jobsByWorkType,
      jobsByExperience,
      topCompanies
    ] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { isActive: true, status: "PUBLISHED" } }),
      prisma.jobApplication.count(),
      prisma.job.groupBy({
        by: ["workType"],
        _count: { id: true },
        where: { isActive: true, status: "PUBLISHED" }
      }),
      prisma.job.groupBy({
        by: ["experience"],
        _count: { id: true },
        where: { isActive: true, status: "PUBLISHED" }
      }),
      prisma.job.findMany({
        select: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              _count: { select: { jobs: true } }
            }
          }
        },
        where: { isActive: true, status: "PUBLISHED" },
        take: 10
      })
    ])

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      jobsByWorkType,
      jobsByExperience,
      topCompanies: topCompanies.map(job => job.company)
    }
  }

  /**
   * Get similar jobs
   */
  static async getSimilarJobs(jobId: string, limit: number = 5) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        title: true,
        workType: true,
        experience: true,
        accommodations: true,
        companyId: true
      }
    })

    if (!job) {
      return []
    }

    const similarJobs = await prisma.job.findMany({
      where: {
        AND: [
          { id: { not: jobId } },
          { isActive: true },
          { status: "PUBLISHED" },
          {
            OR: [
              { workType: job.workType },
              { experience: job.experience },
              { accommodations: { hasSome: job.accommodations } },
              { companyId: job.companyId }
            ]
          }
        ]
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            size: true,
            industry: true,
            location: true
          }
        },
        _count: {
          select: {
            applications: true,
            savedJobs: true
          }
        }
      },
      take: limit,
      orderBy: { createdAt: "desc" }
    })

    return similarJobs
  }
}
