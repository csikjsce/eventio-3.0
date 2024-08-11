-- CreateEnum
CREATE TYPE "EVENT_TYPE" AS ENUM ('COMPETETION', 'WORKSHOP', 'SPEAKER_SESSION', 'ONLINE', 'FEST');

-- CreateEnum
CREATE TYPE "STATE" AS ENUM ('DRAFT', 'APPLIED_FOR_APPROVAL', 'UNLISTED', 'UPCOMING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'TICKET_OPEN', 'TICKET_CLOSED', 'ONGOING', 'COMPLETED', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ATTENDANCE_TYPE" AS ENUM ('TICKET', 'BLE');

-- CreateEnum
CREATE TYPE "REGISTRATION_TYPE" AS ENUM ('EXTERNAL', 'ONPLATFORM');

-- CreateEnum
CREATE TYPE "BRANCH" AS ENUM ('Artificial_Intelligence_And_Data_Science', 'Computer_Engineering', 'Computer_And_Communication_Engineering', 'Computer_Science_And_Business_Systems', 'Electronics_And_Computer_Engineering', 'Electronics_And_Telecommunication_Engineering', 'Electronics_Engineering', 'Information_Technology', 'Mechanical_Engineering', 'Robotics_And_Artificial_Intelligence');

-- CreateEnum
CREATE TYPE "GENDER" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('ADMIN', 'USER', 'COUNCIL', 'FACULTY');

-- CreateEnum
CREATE TYPE "PAYMENT_STATUS" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'MANUAL');

-- CreateTable
CREATE TABLE "Events" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "long_description" TEXT NOT NULL,
    "tag_line" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fee" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "event_type" "EVENT_TYPE" NOT NULL,
    "dates" TIMESTAMP(3)[],
    "venue" TEXT NOT NULL,
    "organizer_id" INTEGER NOT NULL,
    "ma_ppt" INTEGER NOT NULL,
    "min_ppt" INTEGER NOT NULL,
    "tags" TEXT[],
    "state" "STATE" NOT NULL DEFAULT 'DRAFT',
    "state_history" "STATE"[],
    "updated_at" TIMESTAMP(3) NOT NULL,
    "banner_url" TEXT NOT NULL,
    "logo_image__url" TEXT NOT NULL,
    "event_page_image_url" TEXT NOT NULL,
    "parentId" INTEGER,
    "is_feedback_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_only_somaiya" BOOLEAN NOT NULL DEFAULT true,
    "attendance_type" "ATTENDANCE_TYPE",
    "registration_type" "REGISTRATION_TYPE" NOT NULL DEFAULT 'ONPLATFORM',
    "external_registration_link" TEXT NOT NULL,
    "is_ticket_feature_enabled" BOOLEAN NOT NULL,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "google_id" TEXT NOT NULL,
    "degree" TEXT,
    "brach" "BRANCH",
    "gender" "GENDER",
    "interests" TEXT[],
    "name" TEXT NOT NULL,
    "phone_number" INTEGER,
    "photo_url" TEXT NOT NULL,
    "roll_number" INTEGER,
    "year" INTEGER,
    "role" "ROLE" NOT NULL DEFAULT 'USER',
    "about" TEXT,
    "college" TEXT,
    "is_somaiya_student" BOOLEAN NOT NULL,
    "council_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "refresh_token" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "team_id" INTEGER,
    "event_id" INTEGER NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "paid_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registered_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_status" "PAYMENT_STATUS" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "ticket_collected" BOOLEAN DEFAULT false,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant_user" (
    "participant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Participant_user_pkey" PRIMARY KEY ("participant_id","user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_google_id_key" ON "User"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_refresh_token_key" ON "User"("refresh_token");

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant_user" ADD CONSTRAINT "Participant_user_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant_user" ADD CONSTRAINT "Participant_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
