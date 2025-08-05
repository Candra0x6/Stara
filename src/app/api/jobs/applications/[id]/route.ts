import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { UpdateJobApplicationSchema } from "@/lib/validations/job"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET single job application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const applicationId = id

    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
                industry: true
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
                location: true,
                resumeUrl: true
              }
            }
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      )
    }

    // Check if user owns this application or is an admin/employer
    const isOwner = application.userId === session.user.id
    const isAdmin = session.user.role === "ADMIN"
    const isEmployer = session.user.role === "EMPLOYER" 

    if (!isOwner && !isAdmin && !isEmployer) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: application
    })

  } catch (error) {
    console.error("Error fetching job application:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT update job application
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const applicationId = id
    const body = await request.json()
    
    // Validate request body
    const validatedData = UpdateJobApplicationSchema.parse({
      ...body,
      id: applicationId
    })

    // Get the application to check permissions
    const existingApplication = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: true
          }
        }
      }
    })

    if (!existingApplication) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      )
    }

    // Check permissions
    const isOwner = existingApplication.userId === session.user.id
    const isAdmin = session.user.role === "ADMIN"
    const isEmployer = session.user.role === "EMPLOYER"

    if (!isOwner && !isAdmin && !isEmployer) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      )
    }

    // Update data preparation
    const updateData: any = {}
    
    if (validatedData.status && (isAdmin || isEmployer)) {
      updateData.status = validatedData.status
      
      // Set appropriate timestamps based on status
      switch (validatedData.status) {
        case "REVIEWING":
          updateData.reviewedAt = new Date()
          break
        case "INTERVIEW_SCHEDULED":
          if (validatedData.interviewAt) {
            updateData.interviewAt = new Date(validatedData.interviewAt)
          }
          break
        case "REJECTED":
          updateData.rejectedAt = new Date()
          break
        case "ACCEPTED":
          updateData.acceptedAt = new Date()
          break
      }
    }

    if (validatedData.employerNotes && (isAdmin || isEmployer)) {
      updateData.employerNotes = validatedData.employerNotes
    }

    // Update the application
    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: updateData,
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

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: "Application updated successfully"
    })

  } catch (error) {
    console.error("Error updating job application:", error)
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Invalid request data", details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE job application
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const applicationId = id

    // Get the application to check permissions
    const existingApplication = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: true
      }
    })

    if (!existingApplication) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      )
    }

    // Check permissions - only application owner or admin can delete
    const isOwner = existingApplication.userId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      )
    }

    // Delete the application
    await prisma.jobApplication.delete({
      where: { id: applicationId }
    })

    // Update job application count
    await prisma.job.update({
      where: { id: existingApplication.jobId },
      data: {
        applicationCount: {
          decrement: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting job application:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
