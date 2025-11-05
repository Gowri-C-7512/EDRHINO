-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'assistent');

-- CreateTable
CREATE TABLE "Room" (
    "room_name" TEXT NOT NULL,
    "room_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("room_id")
);

-- CreateTable
CREATE TABLE "Message" (
    "role" "Role",
    "content" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;
