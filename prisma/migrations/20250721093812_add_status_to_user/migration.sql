/*
  Warnings:

  - You are about to drop the column `accessibilityNeeds` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `availability` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `companySize` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `desiredSalary` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `githubUrl` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `linkedinUrl` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `portfolioUrl` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `websiteUrl` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `workType` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `UserProfile` table. All the data in the column will be lost.
  - The `experience` column on the `UserProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `education` column on the `UserProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `certifications` column on the `UserProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `ProfileSetup` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "ProfileSetup" DROP CONSTRAINT "ProfileSetup_userId_fkey";

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "accessibilityNeeds",
DROP COLUMN "address",
DROP COLUMN "availability",
DROP COLUMN "bio",
DROP COLUMN "city",
DROP COLUMN "companyName",
DROP COLUMN "companySize",
DROP COLUMN "country",
DROP COLUMN "desiredSalary",
DROP COLUMN "githubUrl",
DROP COLUMN "industry",
DROP COLUMN "linkedinUrl",
DROP COLUMN "portfolioUrl",
DROP COLUMN "skills",
DROP COLUMN "state",
DROP COLUMN "title",
DROP COLUMN "websiteUrl",
DROP COLUMN "workType",
DROP COLUMN "zipCode",
ADD COLUMN     "additionalInfo" TEXT,
ADD COLUMN     "assistiveTech" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "completedSteps" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "currentStep" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "customSummary" TEXT,
ADD COLUMN     "disabilityTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "email" TEXT,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "hardSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "industries" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "location" TEXT,
ADD COLUMN     "preferredName" TEXT,
ADD COLUMN     "resumeUrl" TEXT,
ADD COLUMN     "softSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "status" "ProfileStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "supportNeeds" TEXT,
ADD COLUMN     "workArrangement" TEXT,
DROP COLUMN "experience",
ADD COLUMN     "experience" JSONB[] DEFAULT ARRAY[]::JSONB[],
DROP COLUMN "education",
ADD COLUMN     "education" JSONB[] DEFAULT ARRAY[]::JSONB[],
DROP COLUMN "certifications",
ADD COLUMN     "certifications" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- DropTable
DROP TABLE "ProfileSetup";

-- DropEnum
DROP TYPE "ProfileSetupStatus";

-- CreateIndex
CREATE INDEX "UserProfile_status_idx" ON "UserProfile"("status");
