-- CreateTable
CREATE TABLE "Admins" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "role" "ROLE" NOT NULL DEFAULT 'COUNCIL',

    CONSTRAINT "Admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admins_email_key" ON "Admins"("email");
