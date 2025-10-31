/*
  Warnings:

  - Added the required column `provider` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `standard` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "provider" TEXT NOT NULL,
ADD COLUMN     "standard" TEXT NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL;
