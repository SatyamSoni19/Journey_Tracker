/*
  Warnings:

  - You are about to drop the column `mood` on the `TimelineEntry` table. All the data in the column will be lost.
  - You are about to drop the column `weather` on the `TimelineEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Journey" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "formattedAddress" TEXT,
ADD COLUMN     "googlePlaceName" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "placeId" TEXT,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "TimelineEntry" DROP COLUMN "mood",
DROP COLUMN "weather",
ADD COLUMN     "formattedAddress" TEXT,
ADD COLUMN     "googlePlaceName" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "placeId" TEXT;

-- CreateTable
CREATE TABLE "AIPlan" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIPlan_userId_idx" ON "AIPlan"("userId");

-- CreateIndex
CREATE INDEX "AIPlan_journeyId_idx" ON "AIPlan"("journeyId");

-- AddForeignKey
ALTER TABLE "AIPlan" ADD CONSTRAINT "AIPlan_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIPlan" ADD CONSTRAINT "AIPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
