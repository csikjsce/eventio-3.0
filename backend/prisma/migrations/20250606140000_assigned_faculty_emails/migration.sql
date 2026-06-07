-- AlterTable
ALTER TABLE "Events" ADD COLUMN "assigned_faculty_emails" TEXT[] DEFAULT ARRAY[]::TEXT[];
