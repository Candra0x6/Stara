import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const ShareApplicationSchema = z.object({
  applicationId: z.string().cuid("Invalid application ID"),
  shareType: z.enum(["email", "link", "linkedin", "twitter"]),
  recipientEmail: z.string().email().optional(),
  message: z.string().optional()
})

/**
 * POST /api/jobs/applications/share
 * Create a shareable link for an application
 */
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
    const validatedData = ShareApplicationSchema.parse(body)

    // Verify the application belongs to the user
    const application = await prisma.jobApplication.findUnique({
      where: { 
        id: validatedData.applicationId,
        userId: session.user.id 
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true
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

    // Generate shareable content
    const shareData = {
      applicationId: application.id,
      jobTitle: application.job.title,
      companyName: application.job.company.name,
      applicantName: session.user.name,
      status: application.status,
      appliedAt: application.appliedAt,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/applications/${application.id}`,
      message: validatedData.message || `I've applied for ${application.job.title} at ${application.job.company.name}`
    }

    // TODO: Implement email sending logic here if shareType is 'email'
    if (validatedData.shareType === 'email' && validatedData.recipientEmail) {
      // Send email with application details
      // Implementation depends on your email service (SendGrid, etc.)
    }

    return NextResponse.json({
      success: true,
      data: shareData
    })

  } catch (error) {
    console.error("Error sharing application:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        // @ts-ignore
        { success: false, error: "Invalid input data", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
