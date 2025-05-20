/*
  Warnings:

  - You are about to drop the column `userId` on the `SparkIssuer` table. All the data in the column will be lost.
  - You are about to drop the column `paymentRequestId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "SparkIssuer" DROP CONSTRAINT "SparkIssuer_userId_fkey";

-- DropIndex
DROP INDEX "SparkIssuer_userId_key";

-- AlterTable
ALTER TABLE "SparkIssuer" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "paymentRequestId",
ADD COLUMN     "sparkIssuerId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_sparkIssuerId_fkey" FOREIGN KEY ("sparkIssuerId") REFERENCES "SparkIssuer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
