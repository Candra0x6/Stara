/**
 * Recommendation Service - Client-side service for managing job recommendations
 * Provides a clean interface for recommendation operations
 */

import { JobRecommendationRating, Job, Company } from '@prisma/client';

export interface RecommendationUpdateData {
  jobId: string;
  rating: number;
  feedback?: string;
  reason?: 'PERFECT_MATCH' | 'GOOD_FIT' | 'SOME_INTEREST' | 'NOT_RELEVANT' | 'POOR_MATCH' | 'ALREADY_APPLIED' | 'LOCATION_ISSUE' | 'SALARY_MISMATCH' | 'SKILL_MISMATCH' | 'ACCOMMODATION_CONCERN';
  isHelpful?: boolean;
}

export interface RecommendationResponse {
  success: boolean;
  data?: {
    recommendations: (JobRecommendationRating & {
      job: Job & {
        company: Company;
      };
    })[];
    analysis?: {
      totalJobsAnalyzed: number;
      topMatchingFactors: string[];
      recommendedSkillImprovements: string[];
      accommodationInsights: string[];
    };
    cached?: boolean;
    generatedAt: Date;
  };
  message?: string;
  error?: string;
}

export interface AnalyticsResponse {
  success: boolean;
  data?: {
    overview: {
      totalRecommendations: number;
      averageRating: number;
      conversionRate: number;
      period: string;
      startDate: Date;
      endDate: Date;
    };
    ratingDistribution: { rating: number; count: number }[];
    reasonDistribution: { reason: string; count: number }[];
    helpfulnessStats: { helpful: number; notHelpful: number };
    matchScoreStats: { average: number; minimum: number; maximum: number };
    topRatedJobs: {
      jobId: string;
      jobTitle: string;
      companyName: string;
      rating: number;
      matchScore: number;
      reason: string;
    }[];
    userEngagement: {
      userId: string;
      recommendationCount: number;
      averageRating: number;
    }[];
    accommodationInsights: {
      accommodations: string[];
      jobCount: number;
      averageRating: number;
    }[];
  };
  error?: string;
}

class RecommendationService {
  private baseUrl = '/api/recommendations';

  /**
   * Get job recommendations for a user
   */
  async getRecommendations(
    userId: string,
    options?: {
      regenerate?: boolean;
      limit?: number;
    }
  ): Promise<RecommendationResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (options?.regenerate) searchParams.append('regenerate', 'true');
      if (options?.limit) searchParams.append('limit', options.limit.toString());

      const url = `${this.baseUrl}/${userId}?${searchParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch recommendations');
      }

      return data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch recommendations',
      };
    }
  }

  /**
   * Update a recommendation rating
   */
  async updateRecommendation(
    userId: string,
    data: RecommendationUpdateData
  ): Promise<{ success: boolean; data?: any; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update recommendation');
      }

      return result;
    } catch (error) {
      console.error('Error updating recommendation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update recommendation',
      };
    }
  }

  /**
   * Delete recommendation(s)
   */
  async deleteRecommendation(
    userId: string,
    jobId?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const searchParams = new URLSearchParams();
      if (jobId) searchParams.append('jobId', jobId);

      const url = `${this.baseUrl}/${userId}?${searchParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete recommendation');
      }

      return result;
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete recommendation',
      };
    }
  }

  /**
   * Get recommendation analytics (admin only)
   */
  async getAnalytics(params?: {
    period?: '7d' | '30d' | '90d';
    userId?: string;
  }): Promise<AnalyticsResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.period) searchParams.append('period', params.period);
      if (params?.userId) searchParams.append('userId', params.userId);

      const url = `${this.baseUrl}/analytics?${searchParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics');
      }

      return data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
      };
    }
  }

  /**
   * Execute analytics actions (admin only)
   */
  async executeAnalyticsAction(
    action: 'regenerate_all' | 'cleanup_old' | 'refresh_user',
    userId?: string
  ): Promise<{ success: boolean; message?: string; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, userId }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to execute action');
      }

      return result;
    } catch (error) {
      console.error('Error executing analytics action:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute action',
      };
    }
  }

  /**
   * Force regenerate recommendations for a user
   */
  async regenerateRecommendations(userId: string): Promise<RecommendationResponse> {
    return this.getRecommendations(userId, { regenerate: true });
  }

  /**
   * Mark recommendation as helpful/not helpful
   */
  async markRecommendationHelpful(
    userId: string,
    jobId: string,
    isHelpful: boolean
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const recommendation = await this.getRecommendations(userId);
      
      if (!recommendation.success || !recommendation.data) {
        throw new Error('Failed to fetch current recommendations');
      }

      const currentRec = recommendation.data.recommendations.find(r => r.jobId === jobId);
      
      if (!currentRec) {
        throw new Error('Recommendation not found');
      }

      return this.updateRecommendation(userId, {
        jobId,
        rating: currentRec.rating,
        feedback: currentRec.feedback || undefined,
        reason: currentRec.reason || undefined,
        isHelpful,
      });
    } catch (error) {
      console.error('Error marking recommendation helpful:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update recommendation',
      };
    }
  }

  /**
   * Get recommendation statistics for a user
   */
  async getUserRecommendationStats(userId: string): Promise<{
    success: boolean;
    data?: {
      totalRecommendations: number;
      averageRating: number;
      helpfulRecommendations: number;
      recentActivity: Date | null;
    };
    error?: string;
  }> {
    try {
      const recommendations = await this.getRecommendations(userId);
      
      if (!recommendations.success || !recommendations.data) {
        return {
          success: false,
          error: 'Failed to fetch recommendations',
        };
      }

      const recs = recommendations.data.recommendations;
      const totalRecommendations = recs.length;
      const averageRating = totalRecommendations > 0 
        ? recs.reduce((sum, rec) => sum + rec.rating, 0) / totalRecommendations 
        : 0;
      const helpfulRecommendations = recs.filter(rec => rec.isHelpful === true).length;
      const recentActivity = totalRecommendations > 0 
        ? new Date(Math.max(...recs.map(rec => new Date(rec.createdAt).getTime())))
        : null;

      return {
        success: true,
        data: {
          totalRecommendations,
          averageRating,
          helpfulRecommendations,
          recentActivity,
        },
      };
    } catch (error) {
      console.error('Error getting user recommendation stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get statistics',
      };
    }
  }

  /**
   * Validate recommendation update data
   */
  validateRecommendationData(data: RecommendationUpdateData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.jobId?.trim()) {
      errors.push('Job ID is required');
    }

    if (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 10) {
      errors.push('Rating must be a number between 1 and 10');
    }

    if (data.reason && !['PERFECT_MATCH', 'GOOD_FIT', 'SOME_INTEREST', 'NOT_RELEVANT', 'POOR_MATCH', 'ALREADY_APPLIED', 'LOCATION_ISSUE', 'SALARY_MISMATCH', 'SKILL_MISMATCH', 'ACCOMMODATION_CONCERN'].includes(data.reason)) {
      errors.push('Invalid reason provided');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format recommendation for display
   */
  formatRecommendation(recommendation: JobRecommendationRating & {
    job: Job & { company: Company };
  }) {
    return {
      id: recommendation.id,
      jobId: recommendation.jobId,
      title: recommendation.job.title,
      company: recommendation.job.company.name,
      location: recommendation.job.location,
      workType: recommendation.job.workType,
      rating: recommendation.rating,
      matchScore: recommendation.matchScore,
      reason: recommendation.reason,
      feedback: recommendation.feedback,
      isHelpful: recommendation.isHelpful,
      createdAt: recommendation.createdAt,
      updatedAt: recommendation.updatedAt,
    };
  }
}

// Export singleton instance
export const recommendationService = new RecommendationService();
