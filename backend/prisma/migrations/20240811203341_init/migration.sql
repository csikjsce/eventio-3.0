/*
  Warnings:

  - You are about to drop the column `parentId` on the `Events` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Events" DROP CONSTRAINT "Events_parentId_fkey";

-- AlterTable
ALTER TABLE "Events" DROP COLUMN "parentId",
ADD COLUMN     "parent_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
