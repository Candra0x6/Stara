-- CreateEnum
CREATE TYPE "CVFileType" AS ENUM ('RESUME', 'CV', 'PORTFOLIO', 'TEMPLATE', 'COMPONENT');

-- CreateEnum
CREATE TYPE "CVFileStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "CVSectionType" AS ENUM ('PERSONAL_INFO', 'SUMMARY', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 'PROJECTS', 'CERTIFICATIONS', 'LANGUAGES', 'INTERESTS', 'REFERENCES', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CVShareType" AS ENUM ('VIEW', 'EDIT', 'COMMENT');

-- CreateEnum
CREATE TYPE "CVPermission" AS ENUM ('READ', 'WRITE', 'COMMENT', 'SHARE', 'DELETE', 'ADMIN');

-- CreateTable
CREATE TABLE "CVFile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "CVFileType" NOT NULL DEFAULT 'RESUME',
    "userId" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "size" INTEGER,
    "status" "CVFileStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "shareToken" TEXT,
    "allowComments" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastEditedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "CVFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CVSection" (
    "id" TEXT NOT NULL,
    "cvFileId" TEXT NOT NULL,
    "type" "CVSectionType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "styles" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CVSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CVVersion" (
    "id" TEXT NOT NULL,
    "cvFileId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "sectionsData" JSONB NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CVVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CVShare" (
    "id" TEXT NOT NULL,
    "cvFileId" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "shareType" "CVShareType" NOT NULL DEFAULT 'VIEW',
    "permissions" "CVPermission"[] DEFAULT ARRAY[]::"CVPermission"[],
    "sharedWithId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "maxViews" INTEGER,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "allowDownload" BOOLEAN NOT NULL DEFAULT false,
    "allowComments" BOOLEAN NOT NULL DEFAULT false,
    "requireAuth" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAccessedAt" TIMESTAMP(3),

    CONSTRAINT "CVShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CVComment" (
    "id" TEXT NOT NULL,
    "cvFileId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sectionId" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CVComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CVFile_slug_key" ON "CVFile"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CVFile_shareToken_key" ON "CVFile"("shareToken");

-- CreateIndex
CREATE INDEX "CVFile_userId_idx" ON "CVFile"("userId");

-- CreateIndex
CREATE INDEX "CVFile_type_idx" ON "CVFile"("type");

-- CreateIndex
CREATE INDEX "CVFile_status_idx" ON "CVFile"("status");

-- CreateIndex
CREATE INDEX "CVFile_isPublic_idx" ON "CVFile"("isPublic");

-- CreateIndex
CREATE INDEX "CVFile_isTemplate_idx" ON "CVFile"("isTemplate");

-- CreateIndex
CREATE INDEX "CVFile_shareToken_idx" ON "CVFile"("shareToken");

-- CreateIndex
CREATE INDEX "CVSection_cvFileId_idx" ON "CVSection"("cvFileId");

-- CreateIndex
CREATE INDEX "CVSection_type_idx" ON "CVSection"("type");

-- CreateIndex
CREATE INDEX "CVSection_order_idx" ON "CVSection"("order");

-- CreateIndex
CREATE INDEX "CVVersion_cvFileId_idx" ON "CVVersion"("cvFileId");

-- CreateIndex
CREATE INDEX "CVVersion_createdBy_idx" ON "CVVersion"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "CVVersion_cvFileId_version_key" ON "CVVersion"("cvFileId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "CVShare_shareToken_key" ON "CVShare"("shareToken");

-- CreateIndex
CREATE INDEX "CVShare_cvFileId_idx" ON "CVShare"("cvFileId");

-- CreateIndex
CREATE INDEX "CVShare_shareToken_idx" ON "CVShare"("shareToken");

-- CreateIndex
CREATE INDEX "CVShare_sharedWithId_idx" ON "CVShare"("sharedWithId");

-- CreateIndex
CREATE INDEX "CVComment_cvFileId_idx" ON "CVComment"("cvFileId");

-- CreateIndex
CREATE INDEX "CVComment_authorId_idx" ON "CVComment"("authorId");

-- CreateIndex
CREATE INDEX "CVComment_parentId_idx" ON "CVComment"("parentId");

-- AddForeignKey
ALTER TABLE "CVFile" ADD CONSTRAINT "CVFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CVSection" ADD CONSTRAINT "CVSection_cvFileId_fkey" FOREIGN KEY ("cvFileId") REFERENCES "CVFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CVVersion" ADD CONSTRAINT "CVVersion_cvFileId_fkey" FOREIGN KEY ("cvFileId") REFERENCES "CVFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CVVersion" ADD CONSTRAINT "CVVersion_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CVShare" ADD CONSTRAINT "CVShare_cvFileId_fkey" FOREIGN KEY ("cvFileId") REFERENCES "CVFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CVShare" ADD CONSTRAINT "CVShare_sharedWithId_fkey" FOREIGN KEY ("sharedWithId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CVComment" ADD CONSTRAINT "CVComment_cvFileId_fkey" FOREIGN KEY ("cvFileId") REFERENCES "CVFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CVComment" ADD CONSTRAINT "CVComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CVComment" ADD CONSTRAINT "CVComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CVComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
