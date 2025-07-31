/**
 * useRecommendations Hook - React hook for managing job recommendations
 * Provides state management and actions for recommendation operations
 */

import { useState, useEffect, useCallback } from 'react';
import { recommendationService, RecommendationUpdateData } from '@/services/recommendation.service';
import { Job, Company, JobRecommendationRating } from '@prisma/client';

type RecommendationWithJob = JobRecommendationRating & {
  job: Job & {
    company: Company;
  };
};

interface UseRecommendationsState {
  recommendations: RecommendationWithJob[];
  loading: boolean;
  error: string | null;
  regenerating: boolean;
  cached: boolean;
  generatedAt: Date | null;
  analysis: {
    totalJobsAnalyzed: number;
    topMatchingFactors: string[];
    recommendedSkillImprovements: string[];
    accommodationInsights: string[];
  } | null;
}

interface UseRecommendationsActions {
  fetchRecommendations: (regenerate?: boolean) => Promise<void>;
  updateRecommendation: (data: RecommendationUpdateData) => Promise<boolean>;
  deleteRecommendation: (jobId?: string) => Promise<boolean>;
  markHelpful: (jobId: string, isHelpful: boolean) => Promise<boolean>;
  regenerateAll: () => Promise<void>;
  clearError: () => void;
  getStats: () => {
    totalRecommendations: number;
    averageRating: number;
    helpfulCount: number;
    topRated: RecommendationWithJob[];
  };
}

interface UseRecommendationsReturn extends UseRecommendationsState, UseRecommendationsActions {}

export function useRecommendations(userId: string): UseRecommendationsReturn {
  const [state, setState] = useState<UseRecommendationsState>({
    recommendations: [],
    loading: false,
    error: null,
    regenerating: false,
    cached: false,
    generatedAt: null,
    analysis: null,
  });

  /**
   * Fetch recommendations for the user
   */
  const fetchRecommendations = useCallback(async (regenerate: boolean = false) => {
    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      regenerating: regenerate,
    }));

    try {
      const response = await recommendationService.getRecommendations(userId, {
        regenerate,
        limit: 20,
      });

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          recommendations: response.data!.recommendations,
          analysis: response.data!.analysis || null,
          cached: response.data!.cached || false,
          generatedAt: new Date(response.data!.generatedAt),
          loading: false,
          regenerating: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to fetch recommendations',
          loading: false,
          regenerating: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        loading: false,
        regenerating: false,
      }));
    }
  }, [userId]);

  /**
   * Update a recommendation rating
   */
  const updateRecommendation = useCallback(async (data: RecommendationUpdateData): Promise<boolean> => {
    try {
      const response = await recommendationService.updateRecommendation(userId, data);

      if (response.success) {
        // Update the local state
        setState(prev => ({
          ...prev,
          recommendations: prev.recommendations.map(rec => 
            rec.jobId === data.jobId 
              ? { ...rec, ...data, updatedAt: new Date() }
              : rec
          ),
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to update recommendation',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update recommendation',
      }));
      return false;
    }
  }, [userId]);

  /**
   * Delete recommendation(s)
   */
  const deleteRecommendation = useCallback(async (jobId?: string): Promise<boolean> => {
    try {
      const response = await recommendationService.deleteRecommendation(userId, jobId);

      if (response.success) {
        setState(prev => ({
          ...prev,
          recommendations: jobId 
            ? prev.recommendations.filter(rec => rec.jobId !== jobId)
            : [],
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to delete recommendation',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete recommendation',
      }));
      return false;
    }
  }, [userId]);

  /**
   * Mark recommendation as helpful or not helpful
   */
  const markHelpful = useCallback(async (jobId: string, isHelpful: boolean): Promise<boolean> => {
    try {
      const response = await recommendationService.markRecommendationHelpful(userId, jobId, isHelpful);

      if (response.success) {
        setState(prev => ({
          ...prev,
          recommendations: prev.recommendations.map(rec => 
            rec.jobId === jobId 
              ? { ...rec, isHelpful, updatedAt: new Date() }
              : rec
          ),
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to update recommendation',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update recommendation',
      }));
      return false;
    }
  }, [userId]);

  /**
   * Regenerate all recommendations
   */
  const regenerateAll = useCallback(async () => {
    await fetchRecommendations(true);
  }, [fetchRecommendations]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Get recommendation statistics
   */
  const getStats = useCallback(() => {
    const { recommendations } = state;
    
    const totalRecommendations = recommendations.length;
    const averageRating = totalRecommendations > 0 
      ? recommendations.reduce((sum, rec) => sum + rec.rating, 0) / totalRecommendations 
      : 0;
    const helpfulCount = recommendations.filter(rec => rec.isHelpful === true).length;
    const topRated = recommendations
      .filter(rec => rec.rating >= 8)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    return {
      totalRecommendations,
      averageRating,
      helpfulCount,
      topRated,
    };
  }, [state]);

  // Auto-fetch recommendations on mount
  useEffect(() => {
    if (userId) {
      fetchRecommendations();
    }
  }, [userId, fetchRecommendations]);

  return {
    ...state,
    fetchRecommendations,
    updateRecommendation,
    deleteRecommendation,
    markHelpful,
    regenerateAll,
    clearError,
    getStats,
  };
}

/**
 * useRecommendationAnalytics Hook - Hook for managing recommendation analytics (admin)
 */
interface UseRecommendationAnalyticsState {
  analytics: any;
  loading: boolean;
  error: string | null;
}

interface UseRecommendationAnalyticsActions {
  fetchAnalytics: (period?: '7d' | '30d' | '90d', userId?: string) => Promise<void>;
  executeAction: (action: 'regenerate_all' | 'cleanup_old' | 'refresh_user', userId?: string) => Promise<boolean>;
  clearError: () => void;
}

export function useRecommendationAnalytics(): UseRecommendationAnalyticsState & UseRecommendationAnalyticsActions {
  const [state, setState] = useState<UseRecommendationAnalyticsState>({
    analytics: null,
    loading: false,
    error: null,
  });

  const fetchAnalytics = useCallback(async (period: '7d' | '30d' | '90d' = '7d', userId?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await recommendationService.getAnalytics({ period, userId });

      if (response.success) {
        setState(prev => ({
          ...prev,
          analytics: response.data,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to fetch analytics',
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
        loading: false,
      }));
    }
  }, []);

  const executeAction = useCallback(async (
    action: 'regenerate_all' | 'cleanup_old' | 'refresh_user',
    userId?: string
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await recommendationService.executeAnalyticsAction(action, userId);

      if (response.success) {
        setState(prev => ({ ...prev, loading: false }));
        // Refresh analytics after action
        await fetchAnalytics();
        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to execute action',
          loading: false,
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to execute action',
        loading: false,
      }));
      return false;
    }
  }, [fetchAnalytics]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchAnalytics,
    executeAction,
    clearError,
  };
}
