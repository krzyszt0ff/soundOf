/*
  Warnings:

  - You are about to drop the column `duration_in_ms` on the `Track` table. All the data in the column will be lost.
  - Added the required column `duration_in_s` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Track" DROP COLUMN "duration_in_ms",
ADD COLUMN     "duration_in_s" INTEGER NOT NULL;
