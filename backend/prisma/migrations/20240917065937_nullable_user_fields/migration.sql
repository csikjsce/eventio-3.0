-- AlterTable
ALTER TABLE "User" ALTER COLUMN "google_id" DROP NOT NULL,
ALTER COLUMN "photo_url" DROP NOT NULL,
ALTER COLUMN "is_somaiya_student" DROP NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL;
