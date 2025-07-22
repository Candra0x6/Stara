-- CreateEnum
CREATE TYPE "ProfileSetupStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "ProfileSetup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ProfileSetupStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "completedSteps" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "fullName" TEXT,
    "preferredName" TEXT,
    "location" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "disabilityTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "supportNeeds" TEXT,
    "assistiveTech" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "accommodations" TEXT,
    "softSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hardSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "industries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "workArrangement" TEXT,
    "education" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "experience" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "resumeUrl" TEXT,
    "certifications" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "customSummary" TEXT,
    "additionalInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ProfileSetup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfileSetup_userId_key" ON "ProfileSetup"("userId");

-- CreateIndex
CREATE INDEX "ProfileSetup_userId_idx" ON "ProfileSetup"("userId");

-- CreateIndex
CREATE INDEX "ProfileSetup_status_idx" ON "ProfileSetup"("status");

-- AddForeignKey
ALTER TABLE "ProfileSetup" ADD CONSTRAINT "ProfileSetup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
