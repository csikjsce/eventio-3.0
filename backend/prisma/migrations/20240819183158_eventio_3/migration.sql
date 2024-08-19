/*
  Warnings:

  - A unique constraint covering the columns `[phone_number]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roll_number]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_phone_number_key" ON "User"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "User_roll_number_key" ON "User"("roll_number");
