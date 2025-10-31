/*
  Warnings:

  - Added the required column `last_login` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "last_login" TIMESTAMP(3) NOT NULL;
