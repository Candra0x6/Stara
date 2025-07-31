import { NextRequest, NextResponse } from "next/server"
import  prisma  from "@/lib/prisma"
import { CreateJobApplicationSchema } from "@/lib/validations/job"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = CreateJobApplicationSchema.parse(body)

    // Check if job exists and is active
    const job = await prisma.job.findUnique({
      where: { id: validatedData.jobId },
      include: { company: true }
    })

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      )
    }

    if (!job.isActive || job.status !== "PUBLISHED") {
      return NextResponse.json(
        { success: false, error: "Job is not available for applications" },
        { status: 400 }
      )
    }

    // Check if user already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobId_userId: {
          jobId: validatedData.jobId,
          userId: session.user.id
        }
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: "You have already applied to this job" },
        { status: 400 }
      )
    }

    // Create application
    const application = await prisma.jobApplication.create({
      data: {
        ...validatedData,
        userId: session.user.id
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
      where: { id: validatedData.jobId },
      data: { applicationCount: { increment: 1 } }
    })

    return NextResponse.json({
      success: true,
      data: application
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating job application:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    const where: any = {
      userId: session.user.id
    }

    if (status) {
      where.status = status
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

    return NextResponse.json({
      success: true,
      data: {
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
    })
  } catch (error) {
    console.error("Error fetching job applications:", error)
    
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
