-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_receivingUserId_fkey";

-- AlterTable
ALTER TABLE "Transfer" ADD COLUMN     "receivingSparkAddress" TEXT,
ALTER COLUMN "receivingUserId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_receivingUserId_fkey" FOREIGN KEY ("receivingUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
