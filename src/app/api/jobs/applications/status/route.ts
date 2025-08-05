import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * GET /api/jobs/applications/status
 * Get application status summary for the authenticated user
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

    // Get application statistics
    const [totalApplications, statusCounts] = await Promise.all([
      prisma.jobApplication.count({
        where: { userId: session.user.id }
      }),
      prisma.jobApplication.groupBy({
        by: ['status'],
        where: { userId: session.user.id },
        _count: true
      })
    ])

    // Format status counts
    const statusSummary = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count
      return acc
    }, {} as Record<string, number>)

    // Get recent applications (last 5)
    const recentApplications = await prisma.jobApplication.findMany({
      where: { userId: session.user.id },
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

    return NextResponse.json({
      success: true,
      data: {
        totalApplications,
        statusSummary,
        recentApplications
      }
    })

  } catch (error) {
    console.error("Error fetching application status:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
