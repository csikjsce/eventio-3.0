/*
  Warnings:

  - A unique constraint covering the columns `[name,event_id]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invite_code,event_id]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `event_id` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invite_code` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "event_id" INTEGER NOT NULL,
ADD COLUMN     "invite_code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_event_id_key" ON "Team"("name", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "Team_invite_code_event_id_key" ON "Team"("invite_code", "event_id");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
