/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('USER', 'ISSUER');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('US', 'EU');

-- CreateEnum
CREATE TYPE "StripePaymentMethodType" AS ENUM ('US_BANK_ACCOUNT', 'SEPA_DEBIT', 'US_CARD');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'BTC');

-- CreateEnum
CREATE TYPE "TreasuryTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL');

-- CreateEnum
CREATE TYPE "TreasurySource" AS ENUM ('STRIPE', 'CRYPTO');

-- CreateEnum
CREATE TYPE "PaymentRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isWebsiteVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isXVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentRequestId" TEXT,
ADD COLUMN     "profilePicUrl" TEXT,
ADD COLUMN     "region" "Region" NOT NULL DEFAULT 'US',
ADD COLUMN     "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role" "UserType" NOT NULL DEFAULT 'USER',
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "websiteUrl" TEXT,
ADD COLUMN     "xHandle" TEXT;

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "SparkWallet" (
    "id" TEXT NOT NULL,
    "mnemonic" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "validated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SparkWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SparkIssuer" (
    "id" TEXT NOT NULL,
    "mnemonic" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenName" TEXT,
    "tokenTicker" TEXT,
    "tokenPubKey" TEXT,
    "announcementTx" TEXT,
    "decimals" INTEGER,
    "maxSupply" BIGINT,
    "isFreezable" BOOLEAN,
    "xHandle" TEXT,
    "isXVerified" BOOLEAN NOT NULL DEFAULT false,
    "websiteUrl" TEXT,
    "isWebsiteVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SparkIssuer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentRequest" (
    "id" TEXT NOT NULL,
    "status" "PaymentRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestingUserId" TEXT NOT NULL,
    "receivingUserId" TEXT NOT NULL,
    "currency" "Currency" NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "requestingUserId" TEXT NOT NULL,
    "receivingUserId" TEXT NOT NULL,
    "receivingCurrency" "Currency" NOT NULL,
    "receivingAmount" INTEGER NOT NULL,
    "memo" TEXT,
    "destinationCurrency" "Currency" NOT NULL,
    "destinationAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SparkWallet_userId_key" ON "SparkWallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SparkWallet_address_key" ON "SparkWallet"("address");

-- CreateIndex
CREATE UNIQUE INDEX "SparkIssuer_mnemonic_key" ON "SparkIssuer"("mnemonic");

-- CreateIndex
CREATE UNIQUE INDEX "SparkIssuer_userId_key" ON "SparkIssuer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SparkIssuer_tokenPubKey_key" ON "SparkIssuer"("tokenPubKey");

-- CreateIndex
CREATE UNIQUE INDEX "SparkIssuer_announcementTx_key" ON "SparkIssuer"("announcementTx");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "SparkWallet" ADD CONSTRAINT "SparkWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SparkIssuer" ADD CONSTRAINT "SparkIssuer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_requestingUserId_fkey" FOREIGN KEY ("requestingUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_receivingUserId_fkey" FOREIGN KEY ("receivingUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_requestingUserId_fkey" FOREIGN KEY ("requestingUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_receivingUserId_fkey" FOREIGN KEY ("receivingUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
