import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/recommendation-ratings/[id]/route';
import { RecommendationRatingService } from '@/lib/services/recommendation-rating.service';
import { getServerSession } from 'next-auth';

// Mock dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/services/recommendation-rating.service', () => ({
  RecommendationRatingService: {
    getRecommendationRatingById: vi.fn(),
    updateRecommendationRating: vi.fn(),
    deleteRecommendationRating: vi.fn(),
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

describe('/api/recommendation-ratings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET', () => {
    it('should return a specific recommendation rating', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(RecommendationRatingService.getRecommendationRatingById).mockResolvedValue(mockRating);

      const request = new NextRequest('http://localhost/api/recommendation-ratings/rating-123');
      const response = await GET(request, { params: { id: 'rating-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockRating);
      expect(RecommendationRatingService.getRecommendationRatingById).toHaveBeenCalledWith('rating-123');
    });

    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/recommendation-ratings/rating-123');
      const response = await GET(request, { params: { id: 'rating-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when rating not found', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(RecommendationRatingService.getRecommendationRatingById).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/recommendation-ratings/nonexistent');
      const response = await GET(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Recommendation rating not found');
    });
  });

  describe('PUT', () => {
    const updateData = {
      rating: 9,
      feedback: 'Updated feedback',
      isHelpful: false,
    };

    it('should update a recommendation rating', async () => {
      const updatedRating = { ...mockRating, ...updateData };
      
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(RecommendationRatingService.updateRecommendationRating).mockResolvedValue(updatedRating);

      const request = new NextRequest('http://localhost/api/recommendation-ratings/rating-123', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: { id: 'rating-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedRating);
      expect(RecommendationRatingService.updateRecommendationRating).toHaveBeenCalledWith(
        'rating-123',
        'user-123',
        updateData
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/recommendation-ratings/rating-123', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: { id: 'rating-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when rating not found', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(RecommendationRatingService.updateRecommendationRating).mockRejectedValue(
        new Error('Recommendation rating not found')
      );

      const request = new NextRequest('http://localhost/api/recommendation-ratings/nonexistent', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Recommendation rating not found');
    });

    it('should return 403 when user tries to update someone else\'s rating', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(RecommendationRatingService.updateRecommendationRating).mockRejectedValue(
        new Error('Unauthorized: You can only update your own ratings')
      );

      const request = new NextRequest('http://localhost/api/recommendation-ratings/rating-123', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: { id: 'rating-123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Unauthorized: You can only update your own ratings');
    });

    it('should return 400 for invalid update data', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const invalidData = {
        rating: 15, // Invalid rating (too high)
      };

      const request = new NextRequest('http://localhost/api/recommendation-ratings/rating-123', {
        method: 'PUT',
        body: JSON.stringify(invalidData),
      });

      const response = await PUT(request, { params: { id: 'rating-123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('DELETE', () => {
    it('should delete a recommendation rating', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(RecommendationRatingService.deleteRecommendationRating).mockResolvedValue(mockRating);

      const request = new NextRequest('http://localhost/api/recommendation-ratings/rating-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'rating-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Recommendation rating deleted successfully');
      expect(RecommendationRatingService.deleteRecommendationRating).toHaveBeenCalledWith(
        'rating-123',
        'user-123'
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/recommendation-ratings/rating-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'rating-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when rating not found', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(RecommendationRatingService.deleteRecommendationRating).mockRejectedValue(
        new Error('Recommendation rating not found')
      );

      const request = new NextRequest('http://localhost/api/recommendation-ratings/nonexistent', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Recommendation rating not found');
    });

    it('should return 403 when user tries to delete someone else\'s rating', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(RecommendationRatingService.deleteRecommendationRating).mockRejectedValue(
        new Error('Unauthorized: You can only delete your own ratings')
      );

      const request = new NextRequest('http://localhost/api/recommendation-ratings/rating-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'rating-123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Unauthorized: You can only delete your own ratings');
    });
  });
});
