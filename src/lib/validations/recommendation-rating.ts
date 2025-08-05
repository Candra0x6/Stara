import { z } from "zod";

// Enum validation schemas
export const RatingReasonSchema = z.enum([
  "PERFECT_MATCH",
  "GOOD_FIT", 
  "SOME_INTEREST",
  "NOT_RELEVANT",
  "POOR_MATCH",
  "ALREADY_APPLIED",
  "LOCATION_ISSUE",
  "SALARY_MISMATCH",
  "SKILL_MISMATCH",
  "ACCOMMODATION_CONCERN"
]);

// Create recommendation rating schema
export const CreateRecommendationRatingSchema = z.object({
  jobId: z.string().cuid("Invalid job ID format"),
  rating: z.number().int().min(1).max(10),
  feedback: z.string().optional(),
  reason: RatingReasonSchema.optional(),
  recommendedBy: z.string().optional(),
  matchScore: z.number().min(0).max(100).optional(),
  isHelpful: z.boolean().optional(),
});

// Update recommendation rating schema
export const UpdateRecommendationRatingSchema = z.object({
  rating: z.number().int().min(1).max(10).optional(),
  feedback: z.string().optional(),
  reason: RatingReasonSchema.optional(),
  recommendedBy: z.string().optional(),
  matchScore: z.number().min(0).max(100).optional(),
  isHelpful: z.boolean().optional(),
});

// Query parameters schema
export const RecommendationRatingQuerySchema = z.object({
  userId: z.string().cuid().optional(),
  jobId: z.string().cuid().optional(),
  rating: z.string().transform(Number).pipe(z.number().int().min(1).max(10)).optional(),
  reason: RatingReasonSchema.optional(),
  recommendedBy: z.string().optional(),
  isHelpful: z.string().transform((val) => val === 'true').pipe(z.boolean()).optional(),
  // @ts-ignore
  page: z.string().transform(Number).pipe(z.number().int().min(1)).optional().default("1"),
  // @ts-ignore
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional().default("10"),
  sortBy: z.enum(["createdAt", "rating", "matchScore"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Types
export type CreateRecommendationRatingInput = z.infer<typeof CreateRecommendationRatingSchema>;
export type UpdateRecommendationRatingInput = z.infer<typeof UpdateRecommendationRatingSchema>;
export type RecommendationRatingQuery = z.infer<typeof RecommendationRatingQuerySchema>;
export type RatingReason = z.infer<typeof RatingReasonSchema>;
