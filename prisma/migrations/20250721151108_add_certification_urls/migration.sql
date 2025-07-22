-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" TEXT;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "certificationUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
