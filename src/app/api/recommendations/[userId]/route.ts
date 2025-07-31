/**
 * Job Recommendations API Route - GET /api/recommendations/[userId]
 * Handles generating and retrieving job recommendations for users
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { jobRecommendationAI } from '@/lib/ai/job-recommendation-ai';
import { JobRecommendationInput } from '@/lib/ai/job-recommendation-prompt';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const regenerate = searchParams.get('regenerate') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Check if user can access recommendations (own recommendations or admin)
    if (session.user.id !== userId && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    if (userProfile.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Profile must be completed to get recommendations' },
        { status: 400 }
      );
    }

    // Get existing recommendations if not regenerating
    if (!regenerate) {
      const existingRecommendations = await prisma.jobRecommendationRating.findMany({
        where: { 
          userId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        include: {
          job: {
            include: {
              company: true,
            },
          },
        },
        orderBy: { rating: 'desc' },
        take: limit,
      });

      if (existingRecommendations.length > 0) {
        return NextResponse.json({
          success: true,
          data: {
            recommendations: existingRecommendations,
            cached: true,
            generatedAt: existingRecommendations[0].createdAt,
          },
        });
      }
    }

    // Get available jobs (active, published, not applied to)
    const appliedJobIds = await prisma.jobApplication.findMany({
      where: { userId },
      select: { jobId: true },
    });

    const excludeJobIds = appliedJobIds.map((app: { jobId: string }) => app.jobId);

    const availableJobs = await prisma.job.findMany({
      where: {
        status: 'PUBLISHED',
        isActive: true,
        id: { notIn: excludeJobIds },
        OR: [
          {
            applicationDeadline: {
              gte: new Date(),
            },
          },
          {
            applicationDeadline: null,
          },
        ],
      },
      include: {
        company: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 50, // Limit to 50 jobs for analysis
    });

    if (availableJobs.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          recommendations: [],
          message: 'No suitable jobs available at the moment',
        },
      });
    }

    // Prepare AI input
    const aiInput: JobRecommendationInput = {
      userProfile,
      availableJobs,
      preferences: {
        maxRecommendations: limit,
        minMatchScore: 50,
        prioritizeAccommodations: true,
        excludeAppliedJobs: excludeJobIds,
      },
    };

    // Generate AI recommendations
    const aiRecommendations = await jobRecommendationAI.generateRecommendations(aiInput);

    // Save recommendations to database
    const savedRecommendations = await Promise.all(
      aiRecommendations.recommendations.map(async (rec) => {
        try {
          return await prisma.jobRecommendationRating.upsert({
            where: {
              userId_jobId: {
                userId,
                jobId: rec.jobId,
              },
            },
            update: {
              rating: rec.rating,
              feedback: rec.feedback,
              reason: rec.reason,
              recommendedBy: rec.recommendedBy,
              matchScore: rec.matchScore,
            },
            create: {
              userId,
              jobId: rec.jobId,
              rating: rec.rating,
              feedback: rec.feedback,
              reason: rec.reason,
              recommendedBy: rec.recommendedBy,
              matchScore: rec.matchScore,
            },
            include: {
              job: {
                include: {
                  company: true,
                },
              },
            },
          });
        } catch (error) {
          console.error(`Error saving recommendation for job ${rec.jobId}:`, error);
          return null;
        }
      })
    );

    const validRecommendations = savedRecommendations.filter(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        recommendations: validRecommendations,
        analysis: aiRecommendations.analysis,
        cached: false,
        generatedAt: new Date(),
      },
    });

  } catch (error) {
    console.error('Error generating job recommendations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;

    // Check if user can update recommendations (own recommendations only)
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { jobId, rating, feedback, reason, isHelpful } = body;

    // Validate input
    if (!jobId || typeof rating !== 'number' || rating < 1 || rating > 10) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    // Update existing recommendation rating
    const updatedRecommendation = await prisma.jobRecommendationRating.update({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
      data: {
        rating,
        feedback,
        reason,
        isHelpful,
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedRecommendation,
      message: 'Recommendation updated successfully',
    });

  } catch (error) {
    console.error('Error updating recommendation:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Recommendation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    // Check if user can delete recommendations (own recommendations only)
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (jobId) {
      // Delete specific recommendation
      await prisma.jobRecommendationRating.delete({
        where: {
          userId_jobId: {
            userId,
            jobId,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Recommendation deleted successfully',
      });
    } else {
      // Delete all recommendations for user
      const result = await prisma.jobRecommendationRating.deleteMany({
        where: { userId },
      });

      return NextResponse.json({
        success: true,
        message: `${result.count} recommendations deleted successfully`,
      });
    }

  } catch (error) {
    console.error('Error deleting recommendations:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Recommendation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
