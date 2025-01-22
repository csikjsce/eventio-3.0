-- AlterTable
ALTER TABLE "Events" ADD COLUMN     "is_submission_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "more_details_enabled" BOOLEAN NOT NULL DEFAULT false;
