-- ✅ Migration: إضافة جدول تخزين الملفات

-- جدول لتخزين جميع الملفات (صور، فيديوهات، ملفات نصية، إلخ)
CREATE TABLE IF NOT EXISTS "FileStorage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "fileName" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "fileData" BYTEA NOT NULL, -- البيانات الثنائية الخام
  "fileType" TEXT NOT NULL, -- AVATAR, PRODUCT_IMAGE, REPOSITORY_FILE, ACHIEVEMENT_ICON, SUPPORT_ATTACHMENT
  "referenceId" TEXT,
  "uploadedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "FileStorage_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- فهارس لتحسين الأداء
CREATE INDEX "FileStorage_fileType_idx" ON "FileStorage"("fileType");
CREATE INDEX "FileStorage_referenceId_idx" ON "FileStorage"("referenceId");
CREATE INDEX "FileStorage_uploadedBy_idx" ON "FileStorage"("uploadedBy");

-- ✅ تحديث جدول User: استبدال avatarUrl بـ avatarId
ALTER TABLE "User" DROP COLUMN IF EXISTS "avatarUrl";
ALTER TABLE "User" ADD COLUMN "avatarId" TEXT;

-- ✅ تحديث جدول Achievement: استبدال iconUrl بـ iconId
ALTER TABLE "Achievement" DROP COLUMN IF EXISTS "iconUrl";
ALTER TABLE "Achievement" ADD COLUMN "iconId" TEXT;

-- ✅ تحديث جدول StoreItem: استبدال imageUrl بـ imageId
ALTER TABLE "StoreItem" DROP COLUMN IF EXISTS "imageUrl";
ALTER TABLE "StoreItem" ADD COLUMN "imageId" TEXT;

-- ✅ تحديث جدول SiteSettings: إضافة logoId
ALTER TABLE "SiteSettings" ADD COLUMN "logoId" TEXT IF NOT EXISTS;

-- ✅ تحديث جدول SupportTicket: إضافة attachmentId
ALTER TABLE "SupportTicket" ADD COLUMN "attachmentId" TEXT IF NOT EXISTS;
ALTER TABLE "SupportTicket" ADD COLUMN "response" TEXT IF NOT EXISTS;

-- ✅ تحديث جدول RepositoryFile: تحسين التخزين
ALTER TABLE "RepositoryFile" DROP COLUMN IF EXISTS "filePath";
ALTER TABLE "RepositoryFile" ADD COLUMN "fileId" TEXT IF NOT EXISTS;
ALTER TABLE "RepositoryFile" ADD COLUMN "mimeType" TEXT IF NOT EXISTS DEFAULT 'text/plain';
ALTER TABLE "RepositoryFile" ADD COLUMN "size" INTEGER IF NOT EXISTS DEFAULT 0;

-- ✅ إضافة أعمدة updatedAt للجداول الرئيسية
ALTER TABLE "Post" ADD COLUMN "updatedAt" TIMESTAMP(3) IF NOT EXISTS DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Achievement" ADD COLUMN "updatedAt" TIMESTAMP(3) IF NOT EXISTS DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Repository" ADD COLUMN "updatedAt" TIMESTAMP(3) IF NOT EXISTS DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "StoreItem" ADD COLUMN "updatedAt" TIMESTAMP(3) IF NOT EXISTS DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "StoreOrder" ADD COLUMN "updatedAt" TIMESTAMP(3) IF NOT EXISTS DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "SupportTicket" ADD COLUMN "updatedAt" TIMESTAMP(3) IF NOT EXISTS DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "FAQ" ADD COLUMN "updatedAt" TIMESTAMP(3) IF NOT EXISTS DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "SiteSettings" ADD COLUMN "updatedAt" TIMESTAMP(3) IF NOT EXISTS DEFAULT CURRENT_TIMESTAMP;

-- ✅ التأكد من التواريخ صحيحة
UPDATE "SiteSettings" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;
UPDATE "FAQ" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;
