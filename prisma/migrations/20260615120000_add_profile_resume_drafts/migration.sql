-- CreateTable
CREATE TABLE "ProfileResumeDraft" (
    "id" TEXT NOT NULL,
    "jobProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cvData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileResumeDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileResumeDraft_jobProfileId_idx" ON "ProfileResumeDraft"("jobProfileId");

-- AddForeignKey
ALTER TABLE "ProfileResumeDraft" ADD CONSTRAINT "ProfileResumeDraft_jobProfileId_fkey" FOREIGN KEY ("jobProfileId") REFERENCES "JobProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
