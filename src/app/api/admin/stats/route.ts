import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    // Get current date and date ranges
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Execute all statistics queries in parallel
    const [
      totalUsers,
      totalCompanies,
      totalJobs,
      totalApplications,
      activeJobs,
      newUsersThisMonth,
      newApplicationsThisWeek,
      usersByRole,
      jobsByStatus,
      applicationsByStatus,
      topCompanies,
      popularJobs,
      profileCompletionStats
    ] = await Promise.all([
      // Total counts
      prisma.user.count({
        where: { deletedAt: null }
      }),
      prisma.company.count(),
      prisma.job.count(),
      prisma.jobApplication.count(),
      
      // Active jobs
      prisma.job.count({
        where: {
          isActive: true,
          status: "PUBLISHED"
        }
      }),
      
      // New users this month
      prisma.user.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          deletedAt: null
        }
      }),
      
      // New applications this week
      prisma.jobApplication.count({
        where: {
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      
      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
        where: { deletedAt: null }
      }),
      
      // Jobs by status
      prisma.job.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      
      // Applications by status
      prisma.jobApplication.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      
      // Top companies by job count
      prisma.company.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              jobs: {
                where: {
                  isActive: true,
                  status: "PUBLISHED"
                }
              }
            }
          }
        },
        orderBy: {
          jobs: {
            _count: 'desc'
          }
        },
        take: 5
      }),
      
      // Most applied jobs
      prisma.job.findMany({
        select: {
          id: true,
          title: true,
          applicationCount: true,
          company: {
            select: {
              name: true
            }
          }
        },
        where: {
          isActive: true,
          status: "PUBLISHED"
        },
        orderBy: {
          applicationCount: 'desc'
        },
        take: 5
      }),
      
      // Profile completion statistics
      prisma.userProfile.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    ])

    // Calculate growth rates
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    
    const [usersLastMonth, applicationsLastMonth] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          },
          deletedAt: null
        }
      }),
      prisma.jobApplication.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        }
      })
    ])

    // Calculate growth percentages
    const userGrowthRate = usersLastMonth > 0 
      ? ((newUsersThisMonth - usersLastMonth) / usersLastMonth) * 100 
      : 0

    const applicationGrowthRate = applicationsLastMonth > 0
      ? ((newApplicationsThisWeek * 4 - applicationsLastMonth) / applicationsLastMonth) * 100
      : 0

    // Format response data
    const stats = {
      overview: {
        totalUsers,
        totalCompanies,
        totalJobs,
        totalApplications,
        activeJobs,
        newUsersThisMonth,
        newApplicationsThisWeek,
        userGrowthRate: Math.round(userGrowthRate * 100) / 100,
        applicationGrowthRate: Math.round(applicationGrowthRate * 100) / 100
      },
      
      distributions: {
        usersByRole: usersByRole.map(item => ({
          role: item.role,
          count: item._count.role
        })),
        
        jobsByStatus: jobsByStatus.map(item => ({
          status: item.status,
          count: item._count.status
        })),
        
        applicationsByStatus: applicationsByStatus.map(item => ({
          status: item.status,
          count: item._count.status
        })),
        
        profileCompletionStats: profileCompletionStats.map(item => ({
          status: item.status,
          count: item._count.status
        }))
      },
      
      topPerformers: {
        topCompanies: topCompanies.map(company => ({
          id: company.id,
          name: company.name,
          jobCount: company._count.jobs
        })),
        
        popularJobs: popularJobs.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company.name,
          applicationCount: job.applicationCount
        }))
      }
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error("Error fetching admin statistics:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
