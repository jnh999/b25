/*
  Warnings:

  - A unique constraint covering the columns `[tokenName]` on the table `SparkIssuer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tokenTicker]` on the table `SparkIssuer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "SparkIssuer_mnemonic_key";

-- AlterTable
ALTER TABLE "SparkIssuer" ALTER COLUMN "mnemonic" SET DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "SparkIssuer_tokenName_key" ON "SparkIssuer"("tokenName");

-- CreateIndex
CREATE UNIQUE INDEX "SparkIssuer_tokenTicker_key" ON "SparkIssuer"("tokenTicker");
