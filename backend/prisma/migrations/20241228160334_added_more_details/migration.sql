/*
  Warnings:

  - The `more_details` column on the `Participant` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Participant" DROP COLUMN "more_details",
ADD COLUMN     "more_details" JSONB;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "submissions" JSONB;
