/*
  Warnings:

  - Made the column `tokenName` on table `SparkIssuer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tokenTicker` on table `SparkIssuer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `decimals` on table `SparkIssuer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `maxSupply` on table `SparkIssuer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isFreezable` on table `SparkIssuer` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_sparkIssuerId_fkey";

-- AlterTable
ALTER TABLE "SparkIssuer" ALTER COLUMN "tokenName" SET NOT NULL,
ALTER COLUMN "tokenTicker" SET NOT NULL,
ALTER COLUMN "decimals" SET NOT NULL,
ALTER COLUMN "decimals" SET DEFAULT 6,
ALTER COLUMN "maxSupply" SET NOT NULL,
ALTER COLUMN "maxSupply" SET DEFAULT 0,
ALTER COLUMN "isFreezable" SET NOT NULL,
ALTER COLUMN "isFreezable" SET DEFAULT true;
