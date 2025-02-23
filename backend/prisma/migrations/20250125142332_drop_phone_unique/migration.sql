-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_leader_id_fkey";

-- DropIndex
DROP INDEX "User_phone_number_key";

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
