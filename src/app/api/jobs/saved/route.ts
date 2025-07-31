import { NextRequest, NextResponse } from "next/server"
import  prisma  from "@/lib/prisma"
import { CreateSavedJobSchema } from "@/lib/validations/job"
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
    const validatedData = CreateSavedJobSchema.parse(body)

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: validatedData.jobId }
    })

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      )
    }

    // Check if already saved
    const existingSavedJob = await prisma.savedJob.findUnique({
      where: {
        jobId_userId: {
          jobId: validatedData.jobId,
          userId: session.user.id
        }
      }
    })

    if (existingSavedJob) {
      return NextResponse.json(
        { success: false, error: "Job already saved" },
        { status: 400 }
      )
    }

    // Save job
    const savedJob = await prisma.savedJob.create({
      data: {
        jobId: validatedData.jobId,
        userId: session.user.id
      },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logo: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: savedJob
    }, { status: 201 })
  } catch (error) {
    console.error("Error saving job:", error)
    
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

    const skip = (page - 1) * limit

    const [savedJobs, totalCount] = await Promise.all([
      prisma.savedJob.findMany({
        where: { userId: session.user.id },
        include: {
          job: {
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
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.savedJob.count({
        where: { userId: session.user.id }
      })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: {
        savedJobs,
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
    console.error("Error fetching saved jobs:", error)
    
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("jobId")

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Job ID is required" },
        { status: 400 }
      )
    }

    // Check if saved job exists
    const savedJob = await prisma.savedJob.findUnique({
      where: {
        jobId_userId: {
          jobId,
          userId: session.user.id
        }
      }
    })

    if (!savedJob) {
      return NextResponse.json(
        { success: false, error: "Saved job not found" },
        { status: 404 }
      )
    }

    // Remove saved job
    await prisma.savedJob.delete({
      where: {
        jobId_userId: {
          jobId,
          userId: session.user.id
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "Job removed from saved jobs"
    })
  } catch (error) {
    console.error("Error removing saved job:", error)
    
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
