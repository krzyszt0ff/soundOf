/*
  Warnings:

  - The primary key for the `UserCredentials` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "UserCredentials" DROP CONSTRAINT "UserCredentials_pkey",
ALTER COLUMN "userId" DROP DEFAULT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserCredentials_pkey" PRIMARY KEY ("userId");
DROP SEQUENCE "UserCredentials_userId_seq";
