/*
  Warnings:

  - You are about to drop the `Participant_user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Participant_user" DROP CONSTRAINT "Participant_user_participant_id_fkey";

-- DropForeignKey
ALTER TABLE "Participant_user" DROP CONSTRAINT "Participant_user_user_id_fkey";

-- DropTable
DROP TABLE "Participant_user";
