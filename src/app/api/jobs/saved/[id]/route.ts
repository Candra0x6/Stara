import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET single saved job
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

    const savedJobId = id

    const savedJob = await prisma.savedJob.findUnique({
      where: { id: savedJobId },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
                industry: true,
                size: true,
                location: true
              }
            }
          }
        }
      }
    })

    if (!savedJob) {
      return NextResponse.json(
        { success: false, error: "Saved job not found" },
        { status: 404 }
      )
    }

    // Check if user owns this saved job
    if (savedJob.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: savedJob
    })

  } catch (error) {
    console.error("Error fetching saved job:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE saved job (unsave)
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

    const savedJobId = id

    // Get the saved job to check permissions
    const existingSavedJob = await prisma.savedJob.findUnique({
      where: { id: savedJobId }
    })

    if (!existingSavedJob) {
      return NextResponse.json(
        { success: false, error: "Saved job not found" },
        { status: 404 }
      )
    }

    // Check if user owns this saved job
    if (existingSavedJob.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      )
    }

    // Delete the saved job
    await prisma.savedJob.delete({
      where: { id: savedJobId }
    })

    return NextResponse.json({
      success: true,
      message: "Job unsaved successfully"
    })

  } catch (error) {
    console.error("Error deleting saved job:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
