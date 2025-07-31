import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RecommendationRatingService } from '@/lib/services/recommendation-rating.service';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
const mockPrisma = {
  jobRecommendationRating: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
  job: {
    findUnique: vi.fn(),
  },
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

const mockUser = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
};

const mockJob = {
  id: 'job-123',
  title: 'Software Developer',
  slug: 'software-developer-123',
};

const mockRating = {
  id: 'rating-123',
  userId: 'user-123',
  jobId: 'job-123',
  rating: 8,
  feedback: 'Great job recommendation!',
  reason: 'GOOD_FIT',
  recommendedBy: 'AI',
  matchScore: 85.5,
  isHelpful: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('RecommendationRatingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getRecommendationRatings', () => {
    it('should return paginated ratings with filters', async () => {
      const mockRatings = [mockRating];
      const mockTotal = 1;

      mockPrisma.jobRecommendationRating.findMany.mockResolvedValue(mockRatings);
      mockPrisma.jobRecommendationRating.count.mockResolvedValue(mockTotal);

      const query = {
        userId: 'user-123',
        page: "1",
        limit: "10",
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const result = await RecommendationRatingService.getRecommendationRatings(query);

      expect(result.data).toEqual(mockRatings);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });

      expect(mockPrisma.jobRecommendationRating.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should handle pagination correctly', async () => {
      mockPrisma.jobRecommendationRating.findMany.mockResolvedValue([]);
      mockPrisma.jobRecommendationRating.count.mockResolvedValue(25);

      const query = {
        page: "3",
        limit: "5",
        sortBy: "rating",
        sortOrder: "asc",
      };

      await RecommendationRatingService.getRecommendationRatings(query);

      expect(mockPrisma.jobRecommendationRating.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 10, // (3-1) * 5
        take: 5,
        orderBy: { rating: 'asc' },
        include: expect.any(Object),
      });
    });

    it('should apply multiple filters', async () => {
      mockPrisma.jobRecommendationRating.findMany.mockResolvedValue([]);
      mockPrisma.jobRecommendationRating.count.mockResolvedValue(0);

      const query = {
        userId: 'user-123',
        jobId: 'job-123',
        rating: 8,
        reason: 'GOOD_FIT',
        recommendedBy: 'AI',
        isHelpful: true,
        page: "1",
        limit: "10",
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      await RecommendationRatingService.getRecommendationRatings(query);

      expect(mockPrisma.jobRecommendationRating.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          jobId: 'job-123',
          rating: 8,
          reason: 'GOOD_FIT',
          recommendedBy: 'AI',
          isHelpful: true,
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });
  });

  describe('getRecommendationRatingById', () => {
    it('should return a rating by ID', async () => {
      mockPrisma.jobRecommendationRating.findUnique.mockResolvedValue(mockRating);

      const result = await RecommendationRatingService.getRecommendationRatingById('rating-123');

      expect(result).toEqual(mockRating);
      expect(mockPrisma.jobRecommendationRating.findUnique).toHaveBeenCalledWith({
        where: { id: 'rating-123' },
        include: expect.any(Object),
      });
    });

    it('should return null when rating not found', async () => {
      mockPrisma.jobRecommendationRating.findUnique.mockResolvedValue(null);

      const result = await RecommendationRatingService.getRecommendationRatingById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getRecommendationRatingByUserAndJob', () => {
    it('should return a rating by user and job', async () => {
      mockPrisma.jobRecommendationRating.findUnique.mockResolvedValue(mockRating);

      const result = await RecommendationRatingService.getRecommendationRatingByUserAndJob(
        'user-123',
        'job-123'
      );

      expect(result).toEqual(mockRating);
      expect(mockPrisma.jobRecommendationRating.findUnique).toHaveBeenCalledWith({
        where: {
          userId_jobId: {
            userId: 'user-123',
            jobId: 'job-123',
          },
        },
        include: expect.any(Object),
      });
    });
  });

  describe('createRecommendationRating', () => {
    const createData = {
      jobId: 'job-123',
      rating: 8,
      feedback: 'Great job!',
      reason: 'GOOD_FIT' as const,
    };

    it('should create a new rating successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.job.findUnique.mockResolvedValue(mockJob);
      mockPrisma.jobRecommendationRating.findUnique.mockResolvedValue(null);
      mockPrisma.jobRecommendationRating.create.mockResolvedValue(mockRating);

      const result = await RecommendationRatingService.createRecommendationRating(
        'user-123',
        createData
      );

      expect(result).toEqual(mockRating);
      expect(mockPrisma.jobRecommendationRating.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          ...createData,
        },
        include: expect.any(Object),
      });
    });

    it('should throw error when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.job.findUnique.mockResolvedValue(mockJob);

      await expect(
        RecommendationRatingService.createRecommendationRating('user-123', createData)
      ).rejects.toThrow('User not found');
    });

    it('should throw error when job not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.job.findUnique.mockResolvedValue(null);

      await expect(
        RecommendationRatingService.createRecommendationRating('user-123', createData)
      ).rejects.toThrow('Job not found');
    });

    it('should throw error when rating already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.job.findUnique.mockResolvedValue(mockJob);
      mockPrisma.jobRecommendationRating.findUnique.mockResolvedValue(mockRating);

      await expect(
        RecommendationRatingService.createRecommendationRating('user-123', createData)
      ).rejects.toThrow('Rating already exists for this user and job');
    });
  });

  describe('updateRecommendationRating', () => {
    const updateData = {
      rating: 9,
      feedback: 'Updated feedback',
    };

    it('should update a rating successfully', async () => {
      const updatedRating = { ...mockRating, ...updateData };
      
      mockPrisma.jobRecommendationRating.findUnique.mockResolvedValue(mockRating);
      mockPrisma.jobRecommendationRating.update.mockResolvedValue(updatedRating);

      const result = await RecommendationRatingService.updateRecommendationRating(
        'rating-123',
        'user-123',
        updateData
      );

      expect(result).toEqual(updatedRating);
      expect(mockPrisma.jobRecommendationRating.update).toHaveBeenCalledWith({
        where: { id: 'rating-123' },
        data: updateData,
        include: expect.any(Object),
      });
    });

    it('should throw error when rating not found', async () => {
      mockPrisma.jobRecommendationRating.findUnique.mockResolvedValue(null);

      await expect(
        RecommendationRatingService.updateRecommendationRating('rating-123', 'user-123', updateData)
      ).rejects.toThrow('Recommendation rating not found');
    });

    it('should throw error when user unauthorized', async () => {
      const otherUserRating = { ...mockRating, userId: 'other-user' };
      mockPrisma.jobRecommendationRating.findUnique.mockResolvedValue(otherUserRating);

      await expect(
        RecommendationRatingService.updateRecommendationRating('rating-123', 'user-123', updateData)
      ).rejects.toThrow('Unauthorized: You can only update your own ratings');
    });
  });

  describe('deleteRecommendationRating', () => {
    it('should delete a rating successfully', async () => {
      mockPrisma.jobRecommendationRating.findUnique.mockResolvedValue(mockRating);
      mockPrisma.jobRecommendationRating.delete.mockResolvedValue(mockRating);

      const result = await RecommendationRatingService.deleteRecommendationRating(
        'rating-123',
        'user-123'
      );

      expect(result).toEqual(mockRating);
      expect(mockPrisma.jobRecommendationRating.delete).toHaveBeenCalledWith({
        where: { id: 'rating-123' },
      });
    });

    it('should throw error when rating not found', async () => {
      mockPrisma.jobRecommendationRating.findUnique.mockResolvedValue(null);

      await expect(
        RecommendationRatingService.deleteRecommendationRating('rating-123', 'user-123')
      ).rejects.toThrow('Recommendation rating not found');
    });

    it('should throw error when user unauthorized', async () => {
      const otherUserRating = { ...mockRating, userId: 'other-user' };
      mockPrisma.jobRecommendationRating.findUnique.mockResolvedValue(otherUserRating);

      await expect(
        RecommendationRatingService.deleteRecommendationRating('rating-123', 'user-123')
      ).rejects.toThrow('Unauthorized: You can only delete your own ratings');
    });
  });

  describe('getUserRatingStats', () => {
    it('should return user rating statistics', async () => {
      const mockAggregateResult = {
        _avg: { rating: 7.5, matchScore: 82.3 },
        _count: { _all: 10, isHelpful: 8 },
      };

      const mockRatingDistribution = [
        { rating: 5, _count: { rating: 2 } },
        { rating: 8, _count: { rating: 5 } },
        { rating: 10, _count: { rating: 3 } },
      ];

      const mockReasonDistribution = [
        { reason: 'GOOD_FIT', _count: { reason: 6 } },
        { reason: 'PERFECT_MATCH', _count: { reason: 4 } },
      ];

      mockPrisma.jobRecommendationRating.aggregate.mockResolvedValue(mockAggregateResult);
      mockPrisma.jobRecommendationRating.groupBy
        .mockResolvedValueOnce(mockRatingDistribution)
        .mockResolvedValueOnce(mockReasonDistribution);

      const result = await RecommendationRatingService.getUserRatingStats('user-123');

      expect(result).toEqual({
        totalRatings: 10,
        averageRating: 7.5,
        averageMatchScore: 82.3,
        helpfulRatings: 8,
        ratingDistribution: mockRatingDistribution,
        reasonDistribution: mockReasonDistribution,
      });
    });
  });

  describe('getJobRatingStats', () => {
    it('should return job rating statistics', async () => {
      const mockAggregateResult = {
        _avg: { rating: 8.2, matchScore: 75.6 },
        _count: { _all: 15, isHelpful: 12 },
      };

      const mockRatingDistribution = [
        { rating: 7, _count: { rating: 3 } },
        { rating: 8, _count: { rating: 7 } },
        { rating: 9, _count: { rating: 5 } },
      ];

      mockPrisma.jobRecommendationRating.aggregate.mockResolvedValue(mockAggregateResult);
      mockPrisma.jobRecommendationRating.groupBy.mockResolvedValue(mockRatingDistribution);

      const result = await RecommendationRatingService.getJobRatingStats('job-123');

      expect(result).toEqual({
        totalRatings: 15,
        averageRating: 8.2,
        averageMatchScore: 75.6,
        helpfulRatings: 12,
        ratingDistribution: mockRatingDistribution,
      });
    });
  });
});
