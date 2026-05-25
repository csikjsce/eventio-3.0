/*
  Warnings:

  - You are about to drop the column `faculty_advisors` on the `CouncilProfile` table. All the data in the column will be lost.
  - You are about to drop the column `members` on the `CouncilProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CouncilProfile" DROP COLUMN "faculty_advisors",
DROP COLUMN "members";

-- CreateTable
CREATE TABLE "CouncilMember" (
    "id" SERIAL NOT NULL,
    "council_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Member',
    "team" TEXT NOT NULL DEFAULT 'Technical',
    "is_head" BOOLEAN NOT NULL DEFAULT false,
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouncilMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacultyAdvisor" (
    "id" SERIAL NOT NULL,
    "council_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dept" TEXT NOT NULL DEFAULT '',
    "designation" TEXT NOT NULL DEFAULT 'Faculty Advisor',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacultyAdvisor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CouncilMember" ADD CONSTRAINT "CouncilMember_council_id_fkey" FOREIGN KEY ("council_id") REFERENCES "CouncilProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultyAdvisor" ADD CONSTRAINT "FacultyAdvisor_council_id_fkey" FOREIGN KEY ("council_id") REFERENCES "CouncilProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
