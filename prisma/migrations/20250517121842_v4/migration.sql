-- CreateEnum
CREATE TYPE "StripePaymentType" AS ENUM ('US_BANK_ACCOUNT', 'SEPA_DEBIT', 'US_CARD');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stripePaymentId" TEXT,
ADD COLUMN     "stripePaymentType" "StripePaymentType";

-- DropEnum
DROP TYPE "StripePaymentMethodType";
