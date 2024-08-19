/*
  Warnings:

  - You are about to drop the column `brach` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "brach",
ADD COLUMN     "branch" "BRANCH";
