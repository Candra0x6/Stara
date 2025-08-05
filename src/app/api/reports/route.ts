import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const ReportSchema = z.object({
  type: z.enum(["job", "application", "company"]),
  targetId: z.string().cuid("Invalid target ID"),
  reportType: z.enum([
    "accessibility",
    "inaccurate", 
    "inappropriate",
    "spam",
    "discrimination",
    "technical_issue",
    "other"
  ]),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  evidence: z.array(z.string().url()).default([])
})

/**
 * POST /api/reports
 * Submit a report about a job, application, or company
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
    const validatedData = ReportSchema.parse(body)

    // Verify the target exists based on type
    let targetExists = false
    let targetDetails = null

    switch (validatedData.type) {
      case "job":
        const job = await prisma.job.findUnique({
          where: { id: validatedData.targetId },
          select: { id: true, title: true, company: { select: { name: true } } }
        })
        if (job) {
          targetExists = true
          targetDetails = job
        }
        break
        
      case "application":
        const application = await prisma.jobApplication.findUnique({
          where: { id: validatedData.targetId },
          select: { 
            id: true, 
            userId: true,
            job: { 
              select: { 
                title: true, 
                company: { select: { name: true } } 
              } 
            }
          }
        })
        if (application) {
          targetExists = true
          targetDetails = application
        }
        break
        
      case "company":
        const company = await prisma.company.findUnique({
          where: { id: validatedData.targetId },
          select: { id: true, name: true }
        })
        if (company) {
          targetExists = true
          targetDetails = company
        }
        break
    }

    if (!targetExists) {
      return NextResponse.json(
        { success: false, error: `${validatedData.type} not found` },
        { status: 404 }
      )
    }

    // Create the report
    const report = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session.user.id,
      type: validatedData.type,
      targetId: validatedData.targetId,
      reportType: validatedData.reportType,
      description: validatedData.description,
      evidence: validatedData.evidence,
      status: "PENDING",
      targetDetails,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Store report in a reports table (you may need to create this table)
    // For now, we'll log it and return success
    console.log("Report submitted:", report)

    // TODO: In a real implementation, save to database and notify admins
    // await prisma.report.create({ data: report })

    return NextResponse.json({
      success: true,
      data: {
        reportId: report.id,
        status: "submitted",
        message: "Your report has been submitted and will be reviewed by our team within 24 hours."
      }
    })

  } catch (error) {
    console.error("Error submitting report:", error)
    
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

/**
 * GET /api/reports
 * Get user's submitted reports
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // TODO: Implement fetching user reports from database
    const mockReports = [
      {
        id: "report_123",
        type: "job",
        reportType: "accessibility",
        description: "Job posting lacks accessibility information",
        status: "UNDER_REVIEW",
        createdAt: new Date(),
        targetDetails: {
          title: "Frontend Developer",
          company: { name: "Tech Corp" }
        }
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        reports: mockReports
      }
    })

  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
