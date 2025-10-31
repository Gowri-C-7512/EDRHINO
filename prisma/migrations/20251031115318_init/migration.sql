/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - The `provider` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('email', 'google');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
DROP COLUMN "provider",
ADD COLUMN     "provider" "Provider";
