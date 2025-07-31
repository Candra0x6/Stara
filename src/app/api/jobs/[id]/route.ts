import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { UpdateJobSchema } from "@/lib/validations/job"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
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

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.job.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } }
    })

    return NextResponse.json({
      success: true,
      data: job
    })
  } catch (error) {
    console.error("Error fetching job:", error)
    
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = UpdateJobSchema.parse({ ...body, id: params.id })

    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id: params.id },
      include: { company: true }
    })

    if (!existingJob) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      )
    }

    // Update job
    const job = await prisma.job.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        applicationDeadline: validatedData.applicationDeadline 
          ? new Date(validatedData.applicationDeadline)
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

    return NextResponse.json({
      success: true,
      data: job
    })
  } catch (error) {
    console.error("Error updating job:", error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id: params.id }
    })

    if (!existingJob) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      )
    }

    // Delete job (this will cascade to related records)
    await prisma.job.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: "Job deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting job:", error)
    
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
