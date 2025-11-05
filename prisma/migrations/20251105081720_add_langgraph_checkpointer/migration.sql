-- CreateTable
CREATE TABLE "Checkpoints" (
    "id" SERIAL NOT NULL,
    "checkpointId" TEXT NOT NULL,
    "checkpointNs" TEXT,
    "threadId" TEXT NOT NULL,
    "checkpoint" JSONB NOT NULL,
    "metadata" JSONB,
    "parentCheckpointId" TEXT,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Checkpoints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Checkpoints_checkpointId_key" ON "Checkpoints"("checkpointId");

-- CreateIndex
CREATE INDEX "Checkpoints_threadId_idx" ON "Checkpoints"("threadId");
