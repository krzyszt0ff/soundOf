-- CreateTable
CREATE TABLE "UserCredentials" (
    "userId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "userRole" TEXT NOT NULL DEFAULT 'user',

    CONSTRAINT "UserCredentials_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCredentials_email_key" ON "UserCredentials"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserCredentials_username_key" ON "UserCredentials"("username");
