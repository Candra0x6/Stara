import { PrismaClient } from "@prisma/client";
import { 
  CreateRecommendationRatingInput, 
  UpdateRecommendationRatingInput,
  RecommendationRatingQuery 
} from "@/lib/validations/recommendation-rating";

const prisma = new PrismaClient();

export class RecommendationRatingService {
  // Get all recommendation ratings with filtering and pagination
  static async getRecommendationRatings(query: RecommendationRatingQuery) {
    const {
      userId,
      jobId,
      rating,
      reason,
      recommendedBy,
      isHelpful,
      page,
      limit,
      sortBy,
      sortOrder
    } = query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};
    
    if (userId) where.userId = userId;
    if (jobId) where.jobId = jobId;
    if (rating) where.rating = rating;
    if (reason) where.reason = reason;
    if (recommendedBy) where.recommendedBy = recommendedBy;
    if (isHelpful !== undefined) where.isHelpful = isHelpful;

    const [ratings, total] = await Promise.all([
      prisma.jobRecommendationRating.findMany({
        where,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              slug: true,
              location: true,
              workType: true,
              salaryMin: true,
              salaryMax: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  logo: true,
                },
              },
            },
          },
        },
      }),
      prisma.jobRecommendationRating.count({ where }),
    ]);

    return {
      data: ratings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  // Get a specific recommendation rating by ID
  static async getRecommendationRatingById(id: string) {
    return await prisma.jobRecommendationRating.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            location: true,
            workType: true,
            salaryMin: true,
            salaryMax: true,
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    });
  }

  // Get recommendation rating by user and job
  static async getRecommendationRatingByUserAndJob(userId: string, jobId: string) {
    return await prisma.jobRecommendationRating.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            location: true,
            workType: true,
            salaryMin: true,
            salaryMax: true,
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    });
  }

  // Create a new recommendation rating
  static async createRecommendationRating(
    userId: string,
    data: CreateRecommendationRatingInput
  ) {
    // Check if user and job exist
    const [user, job] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.job.findUnique({ where: { id: data.jobId } }),
    ]);

    if (!user) {
      throw new Error("User not found");
    }

    if (!job) {
      throw new Error("Job not found");
    }

    // Check if rating already exists
    const existingRating = await prisma.jobRecommendationRating.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId: data.jobId,
        },
      },
    });

    if (existingRating) {
      throw new Error("Rating already exists for this user and job");
    }

    return await prisma.jobRecommendationRating.create({
      data: {
        userId,
        ...data,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            location: true,
            workType: true,
            salaryMin: true,
            salaryMax: true,
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    });
  }

  // Update an existing recommendation rating
  static async updateRecommendationRating(
    id: string,
    userId: string,
    data: UpdateRecommendationRatingInput
  ) {
    // Check if rating exists and belongs to user
    const existingRating = await prisma.jobRecommendationRating.findUnique({
      where: { id },
    });

    if (!existingRating) {
      throw new Error("Recommendation rating not found");
    }

    if (existingRating.userId !== userId) {
      throw new Error("Unauthorized: You can only update your own ratings");
    }

    return await prisma.jobRecommendationRating.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            location: true,
            workType: true,
            salaryMin: true,
            salaryMax: true,
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    });
  }

  // Delete a recommendation rating
  static async deleteRecommendationRating(id: string, userId: string) {
    // Check if rating exists and belongs to user
    const existingRating = await prisma.jobRecommendationRating.findUnique({
      where: { id },
    });

    if (!existingRating) {
      throw new Error("Recommendation rating not found");
    }

    if (existingRating.userId !== userId) {
      throw new Error("Unauthorized: You can only delete your own ratings");
    }

    return await prisma.jobRecommendationRating.delete({
      where: { id },
    });
  }

  // Get user's rating statistics
  static async getUserRatingStats(userId: string) {
    const stats = await prisma.jobRecommendationRating.aggregate({
      where: { userId },
      _avg: { rating: true, matchScore: true },
      _count: { 
        _all: true,
        isHelpful: true,
      },
    });

    const ratingDistribution = await prisma.jobRecommendationRating.groupBy({
      by: ['rating'],
      where: { userId },
      _count: { rating: true },
    });

    const reasonDistribution = await prisma.jobRecommendationRating.groupBy({
      by: ['reason'],
      where: { userId, reason: { not: null } },
      _count: { reason: true },
    });

    return {
      totalRatings: stats._count._all,
      averageRating: stats._avg.rating,
      averageMatchScore: stats._avg.matchScore,
      helpfulRatings: stats._count.isHelpful,
      ratingDistribution,
      reasonDistribution,
    };
  }

  // Get job's rating statistics
  static async getJobRatingStats(jobId: string) {
    const stats = await prisma.jobRecommendationRating.aggregate({
      where: { jobId },
      _avg: { rating: true, matchScore: true },
      _count: { 
        _all: true,
        isHelpful: true,
      },
    });

    const ratingDistribution = await prisma.jobRecommendationRating.groupBy({
      by: ['rating'],
      where: { jobId },
      _count: { rating: true },
    });

    return {
      totalRatings: stats._count._all,
      averageRating: stats._avg.rating,
      averageMatchScore: stats._avg.matchScore,
      helpfulRatings: stats._count.isHelpful,
      ratingDistribution,
    };
  }
}
