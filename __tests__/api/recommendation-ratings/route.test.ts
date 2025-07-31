import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/recommendation-ratings/route';
import { RecommendationRatingService } from '@/lib/services/recommendation-rating.service';
import { getServerSession } from 'next-auth';

// Mock dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/services/recommendation-rating.service', () => ({
  RecommendationRatingService: {
    getRecommendationRatings: vi.fn(),
    createRecommendationRating: vi.fn(),
  },
}));

const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  },
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
  user: {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  },
  job: {
    id: 'job-123',
    title: 'Software Developer',
    slug: 'software-developer-123',
    location: 'Remote',
    workType: 'FULL_TIME',
    salaryMin: 80000,
    salaryMax: 120000,
    company: {
      id: 'company-123',
      name: 'Tech Corp',
      logo: 'https://example.com/logo.png',
    },
  },
};

describe('/api/recommendation-ratings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET', () => {
    it('should return recommendation ratings with pagination', async () => {
      const mockResult = {
        data: [mockRating],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(RecommendationRatingService.getRecommendationRatings).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost/api/recommendation-ratings?page=1&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResult);
      expect(RecommendationRatingService.getRecommendationRatings).toHaveBeenCalledWith({
        page: "1",
        limit: "10",
        sortBy: "createdAt",
        sortOrder: "desc",
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/recommendation-ratings');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle query parameters correctly', async () => {
      const mockResult = {
        data: [],
        pagination: {
          page: 1,
          limit: 5,
          total: 0,
          totalPages: 0,
        },
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(RecommendationRatingService.getRecommendationRatings).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost/api/recommendation-ratings?userId=user-123&rating=5&isHelpful=true');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(RecommendationRatingService.getRecommendationRatings).toHaveBeenCalledWith({
        userId: 'user-123',
        rating: 5,
        isHelpful: true,
        page: "1",
        limit: "10",
        sortBy: "createdAt",
        sortOrder: "desc",
      });
    });

    it('should return 400 for invalid query parameters', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost/api/recommendation-ratings?rating=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST', () => {
    const validRatingData = {
      jobId: 'job-123',
      rating: 8,
      feedback: 'Great job recommendation!',
      reason: 'GOOD_FIT',
      recommendedBy: 'AI',
      matchScore: 85.5,
      isHelpful: true,
    };

    it('should create a new recommendation rating', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(RecommendationRatingService.createRecommendationRating).mockResolvedValue(mockRating);

      const request = new NextRequest('http://localhost/api/recommendation-ratings', {
        method: 'POST',
        body: JSON.stringify(validRatingData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockRating);
      expect(RecommendationRatingService.createRecommendationRating).toHaveBeenCalledWith(
        'user-123',
        validRatingData
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/recommendation-ratings', {
        method: 'POST',
        body: JSON.stringify(validRatingData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 for invalid rating data', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const invalidData = {
        jobId: 'invalid-id',
        rating: 15, // Invalid rating (too high)
      };

      const request = new NextRequest('http://localhost/api/recommendation-ratings', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 409 when rating already exists', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(RecommendationRatingService.createRecommendationRating).mockRejectedValue(
        new Error('Rating already exists for this user and job')
      );

      const request = new NextRequest('http://localhost/api/recommendation-ratings', {
        method: 'POST',
        body: JSON.stringify(validRatingData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Rating already exists for this user and job');
    });

    it('should return 404 when job not found', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(RecommendationRatingService.createRecommendationRating).mockRejectedValue(
        new Error('Job not found')
      );

      const request = new NextRequest('http://localhost/api/recommendation-ratings', {
        method: 'POST',
        body: JSON.stringify(validRatingData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Job not found');
    });

    it('should handle missing required fields', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const incompleteData = {
        rating: 8,
        // Missing jobId
      };

      const request = new NextRequest('http://localhost/api/recommendation-ratings', {
        method: 'POST',
        body: JSON.stringify(incompleteData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });
});
