/**
 * Job Recommendations Analytics API Route - GET /api/recommendations/analytics
 * Handles analytics and insights for job recommendations system
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can access analytics
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d
    const userId = searchParams.get('userId');

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
    }

    // Build where clause
    const where: any = {
      createdAt: { gte: startDate },
    };

    if (userId) {
      where.userId = userId;
    }

    // Get recommendation statistics
    const [
      totalRecommendations,
      averageRating,
      ratingDistribution,
      reasonDistribution,
      helpfulnessStats,
      topRatedJobs,
      userEngagement,
      accommodationStats,
    ] = await Promise.all([
      // Total recommendations count
      prisma.jobRecommendationRating.count({ where }),

      // Average rating
      prisma.jobRecommendationRating.aggregate({
        where,
        _avg: { rating: true },
      }),

      // Rating distribution
      prisma.jobRecommendationRating.groupBy({
        by: ['rating'],
        where,
        _count: { rating: true },
        orderBy: { rating: 'asc' },
      }),

      // Reason distribution
      prisma.jobRecommendationRating.groupBy({
        by: ['reason'],
        where,
        _count: { reason: true },
        orderBy: { _count: { reason: 'desc' } },
      }),

      // Helpfulness statistics
      prisma.jobRecommendationRating.groupBy({
        by: ['isHelpful'],
        where: { ...where, isHelpful: { not: null } },
        _count: { isHelpful: true },
      }),

      // Top rated jobs
      prisma.jobRecommendationRating.findMany({
        where,
        include: {
          job: {
            include: {
              company: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: [
          { rating: 'desc' },
          { matchScore: 'desc' },
        ],
        take: 10,
      }),

      // User engagement stats
      prisma.jobRecommendationRating.groupBy({
        by: ['userId'],
        where,
        _count: { userId: true },
        _avg: { rating: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),

      // Accommodation type analysis
      prisma.job.groupBy({
        by: ['accommodations'],
        where: {
          recommendationRatings: {
            some: where,
          },
        },
        _count: { accommodations: true },
       
      }),
    ]);

    // Calculate conversion rates (recommendations to applications)
    const recommendedJobIds = await prisma.jobRecommendationRating.findMany({
      where,
      select: { jobId: true, userId: true },
    });

    const applicationCount = await prisma.jobApplication.count({
      where: {
        AND: recommendedJobIds.map(rec => ({
          jobId: rec.jobId,
          userId: rec.userId,
        })),
      },
    });

    const conversionRate = totalRecommendations > 0 
      ? (applicationCount / totalRecommendations) * 100 
      : 0;

    // Calculate match score statistics
    const matchScoreStats = await prisma.jobRecommendationRating.aggregate({
      where,
      _avg: { matchScore: true },
      _min: { matchScore: true },
      _max: { matchScore: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalRecommendations,
          averageRating: averageRating._avg.rating || 0,
          conversionRate,
          period,
          startDate,
          endDate: now,
        },
        ratingDistribution: ratingDistribution.map(item => ({
          rating: item.rating,
          count: item._count.rating,
        })),
        reasonDistribution: reasonDistribution.map(item => ({
          reason: item.reason,
          count: item._count.reason,
        })),
        helpfulnessStats: {
          helpful: helpfulnessStats.find(s => s.isHelpful === true)?._count.isHelpful || 0,
          notHelpful: helpfulnessStats.find(s => s.isHelpful === false)?._count.isHelpful || 0,
        },
        matchScoreStats: {
          average: matchScoreStats._avg.matchScore || 0,
          minimum: matchScoreStats._min.matchScore || 0,
          maximum: matchScoreStats._max.matchScore || 0,
        },
        topRatedJobs: topRatedJobs.map(rec => ({
          jobId: rec.jobId,
          jobTitle: rec.job.title,
          companyName: rec.job.company.name,
          rating: rec.rating,
          matchScore: rec.matchScore,
          reason: rec.reason,
        })),
        userEngagement: userEngagement.map(stat => ({
          userId: stat.userId,
          recommendationCount: stat._count.userId,
          averageRating: stat._avg.rating,
        })),
        accommodationInsights: accommodationStats.map(stat => ({
          accommodations: stat.accommodations,
          jobCount: stat._count.accommodations,
        })),
      },
    });

  } catch (error) {
    console.error('Error fetching recommendation analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can trigger analytics actions
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, userId } = body;

    switch (action) {
      case 'regenerate_all':
        // Trigger regeneration of all user recommendations
        const profiles = await prisma.userProfile.findMany({
          where: { status: 'COMPLETED' },
          select: { userId: true },
        });

        const regenerationResults = await Promise.allSettled(
          profiles.map(async (profile) => {
            // Delete existing recommendations older than 24 hours
            await prisma.jobRecommendationRating.deleteMany({
              where: {
                userId: profile.userId,
                createdAt: {
                  lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
              },
            });
            return profile.userId;
          })
        );

        const successCount = regenerationResults.filter(
          result => result.status === 'fulfilled'
        ).length;

        return NextResponse.json({
          success: true,
          message: `Triggered regeneration for ${successCount} users`,
          data: { processedUsers: successCount },
        });

      case 'cleanup_old':
        // Clean up old recommendations (older than 30 days)
        const cleanupResult = await prisma.jobRecommendationRating.deleteMany({
          where: {
            createdAt: {
              lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        });

        return NextResponse.json({
          success: true,
          message: `Cleaned up ${cleanupResult.count} old recommendations`,
          data: { deletedCount: cleanupResult.count },
        });

      case 'refresh_user':
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID required for refresh action' },
            { status: 400 }
          );
        }

        // Delete user's existing recommendations
        const deleteResult = await prisma.jobRecommendationRating.deleteMany({
          where: { userId },
        });

        return NextResponse.json({
          success: true,
          message: `Cleared ${deleteResult.count} recommendations for user`,
          data: { deletedCount: deleteResult.count },
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error executing analytics action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
