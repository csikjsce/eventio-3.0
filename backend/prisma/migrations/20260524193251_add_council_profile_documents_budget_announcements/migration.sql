-- CreateEnum
CREATE TYPE "DOC_TYPE" AS ENUM ('PROPOSAL', 'REPORT', 'GEOTAG', 'BUDGET', 'CERTIFICATE', 'OTHER');

-- CreateEnum
CREATE TYPE "BUDGET_TYPE" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "ANNOUNCE_CHANNEL" AS ENUM ('EMAIL', 'PUSH', 'BOTH');

-- CreateTable
CREATE TABLE "CouncilProfile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tagline" TEXT,
    "about" TEXT,
    "banner_url" TEXT,
    "instagram" TEXT,
    "website" TEXT,
    "faculty_advisors" JSONB,
    "members" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouncilProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventDocument" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DOC_TYPE" NOT NULL,
    "url" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetItem" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "BUDGET_TYPE" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "channel" "ANNOUNCE_CHANNEL" NOT NULL DEFAULT 'PUSH',
    "recipient_count" INTEGER NOT NULL DEFAULT 0,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" INTEGER NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CouncilProfile_user_id_key" ON "CouncilProfile"("user_id");

-- AddForeignKey
ALTER TABLE "CouncilProfile" ADD CONSTRAINT "CouncilProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDocument" ADD CONSTRAINT "EventDocument_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetItem" ADD CONSTRAINT "BudgetItem_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
