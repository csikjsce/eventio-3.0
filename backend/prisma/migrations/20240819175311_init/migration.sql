/*
  Warnings:

  - The values [Computer_And_Communication_Engineering,Electronics_And_Computer_Engineering,Electronics_And_Telecommunication_Engineering,Electronics_Engineering,Mechanical_Engineering] on the enum `BRANCH` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BRANCH_new" AS ENUM ('Artificial_Intelligence_And_Data_Science', 'Computer_Engineering', 'Computer_And_Communication', 'Computer_Science_And_Business_Systems', 'Electronics_And_Computers', 'Electronics_And_Telecommunications', 'Electronics', 'Information_Technology', 'Mechanical', 'Robotics_And_Artificial_Intelligence', 'Electronics_VLSI');
ALTER TABLE "User" ALTER COLUMN "branch" TYPE "BRANCH_new" USING ("branch"::text::"BRANCH_new");
ALTER TYPE "BRANCH" RENAME TO "BRANCH_old";
ALTER TYPE "BRANCH_new" RENAME TO "BRANCH";
DROP TYPE "BRANCH_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "phone_number" SET DATA TYPE BIGINT,
ALTER COLUMN "roll_number" SET DATA TYPE BIGINT;
