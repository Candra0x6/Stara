import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import {
  CreateJobApplicationRequest,
  UpdateJobApplicationRequest
} from "@/lib/validations/job"

export class JobApplicationService {
  /**
   * Create a new job application
   */
  static async createApplication(userId: string, data: CreateJobApplicationRequest) {
    // Check if job exists and is active
    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
      include: { company: true }
    })

    if (!job) {
      throw new Error("Job not found")
    }

    if (!job.isActive || job.status !== "PUBLISHED") {
      throw new Error("Job is not available for applications")
    }

    // Check if user already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobId_userId: {
          jobId: data.jobId,
          userId
        }
      }
    })

    if (existingApplication) {
      throw new Error("You have already applied to this job")
    }

    // Create application
    const application = await prisma.jobApplication.create({
      data: {
        ...data,
        userId
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true,
                logo: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                preferredName: true,
                phone: true
              }
            }
          }
        }
      }
    })

    // Update job application count
    await prisma.job.update({
      where: { id: data.jobId },
      data: { applicationCount: { increment: 1 } }
    })

    return application
  }

  /**
   * Get user's job applications
   */
  static async getUserApplications(
    userId: string, 
    page: number = 1, 
    limit: number = 10, 
    status?: string
  ) {
    const where: Prisma.JobApplicationWhereInput = {
      userId
    }

    if (status) {
      where.status = status as any
    }

    const skip = (page - 1) * limit

    const [applications, totalCount] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              workType: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  logo: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.jobApplication.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return {
      applications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  }

  /**
   * Get application by ID
   */
  static async getApplicationById(id: string, userId?: string) {
    const where: Prisma.JobApplicationWhereInput = { id }
    
    if (userId) {
      where.userId = userId
    }

    const application = await prisma.jobApplication.findUnique({
      where,
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
                description: true,
                website: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                preferredName: true,
                phone: true,
                resumeUrl: true
              }
            }
          }
        }
      }
    })

    return application
  }

  /**
   * Update application status (for employers)
   */
  static async updateApplicationStatus(id: string, data: UpdateJobApplicationRequest) {
    const application = await prisma.jobApplication.findUnique({
      where: { id }
    })

    if (!application) {
      throw new Error("Application not found")
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id },
      data: {
        ...data,
        reviewedAt: data.status === "REVIEWING" ? new Date() : application.reviewedAt,
        interviewAt: data.interviewAt ? new Date(data.interviewAt) : application.interviewAt,
        rejectedAt: data.status === "REJECTED" ? new Date() : application.rejectedAt,
        acceptedAt: data.status === "ACCEPTED" ? new Date() : application.acceptedAt,
        updatedAt: new Date()
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true,
                logo: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return updatedApplication
  }

  /**
   * Withdraw application (for job seekers)
   */
  static async withdrawApplication(id: string, userId: string) {
    const application = await prisma.jobApplication.findUnique({
      where: { id }
    })

    if (!application) {
      throw new Error("Application not found")
    }

    if (application.userId !== userId) {
      throw new Error("Unauthorized to withdraw this application")
    }

    if (["ACCEPTED", "REJECTED"].includes(application.status)) {
      throw new Error("Cannot withdraw application in current status")
    }

    const withdrawnApplication = await prisma.jobApplication.update({
      where: { id },
      data: {
        status: "WITHDRAWN",
        updatedAt: new Date()
      }
    })

    // Decrement job application count
    await prisma.job.update({
      where: { id: application.jobId },
      data: { applicationCount: { decrement: 1 } }
    })

    return withdrawnApplication
  }

  /**
   * Get applications for a specific job (for employers)
   */
  static async getJobApplications(
    jobId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
  ) {
    const where: Prisma.JobApplicationWhereInput = {
      jobId
    }

    if (status) {
      where.status = status as any
    }

    const skip = (page - 1) * limit

    const [applications, totalCount] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                  preferredName: true,
                  phone: true,
                  resumeUrl: true,
                  disabilityTypes: true,
                  accommodations: true,
                  softSkills: true,
                  hardSkills: true,
                  experience: true,
                  education: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.jobApplication.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return {
      applications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  }

  /**
   * Get application statistics
   */
  static async getApplicationStats(userId?: string, jobId?: string) {
    const where: Prisma.JobApplicationWhereInput = {}
    
    if (userId) {
      where.userId = userId
    }
    
    if (jobId) {
      where.jobId = jobId
    }

    const [
      totalApplications,
      applicationsByStatus,
      recentApplications
    ] = await Promise.all([
      prisma.jobApplication.count({ where }),
      prisma.jobApplication.groupBy({
        by: ["status"],
        _count: { id: true },
        where
      }),
      prisma.jobApplication.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  logo: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 5
      })
    ])

    return {
      totalApplications,
      applicationsByStatus,
      recentApplications
    }
  }
}
