-- CreateEnum
CREATE TYPE "RatingReason" AS ENUM ('PERFECT_MATCH', 'GOOD_FIT', 'SOME_INTEREST', 'NOT_RELEVANT', 'POOR_MATCH', 'ALREADY_APPLIED', 'LOCATION_ISSUE', 'SALARY_MISMATCH', 'SKILL_MISMATCH', 'ACCOMMODATION_CONCERN');

-- CreateTable
CREATE TABLE "JobRecommendationRating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "reason" "RatingReason",
    "recommendedBy" TEXT,
    "matchScore" DOUBLE PRECISION,
    "isHelpful" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRecommendationRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobRecommendationRating_userId_idx" ON "JobRecommendationRating"("userId");

-- CreateIndex
CREATE INDEX "JobRecommendationRating_jobId_idx" ON "JobRecommendationRating"("jobId");

-- CreateIndex
CREATE INDEX "JobRecommendationRating_rating_idx" ON "JobRecommendationRating"("rating");

-- CreateIndex
CREATE INDEX "JobRecommendationRating_recommendedBy_idx" ON "JobRecommendationRating"("recommendedBy");

-- CreateIndex
CREATE UNIQUE INDEX "JobRecommendationRating_userId_jobId_key" ON "JobRecommendationRating"("userId", "jobId");

-- AddForeignKey
ALTER TABLE "JobRecommendationRating" ADD CONSTRAINT "JobRecommendationRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRecommendationRating" ADD CONSTRAINT "JobRecommendationRating_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
