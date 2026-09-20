/*
  Warnings:

  - Added the required column `updated_at` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubscriptionPaymentKind" AS ENUM ('INITIAL', 'RECURRING');

-- AlterTable
ALTER TABLE "subscription_plans" ADD COLUMN     "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "focus" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "route_slug" TEXT,
ADD COLUMN     "tagline" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "cancel_reason" TEXT,
ADD COLUMN     "card_brand" TEXT,
ADD COLUMN     "card_holder_enc" TEXT,
ADD COLUMN     "card_last4" TEXT,
ADD COLUMN     "consent_at" TIMESTAMP(3),
ADD COLUMN     "consent_ip" TEXT,
ADD COLUMN     "consent_text" TEXT,
ADD COLUMN     "failed_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "terms_version" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "subscription_payments" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "kind" "SubscriptionPaymentKind" NOT NULL,
    "provider" TEXT NOT NULL,
    "client_transaction_id" TEXT NOT NULL,
    "provider_transaction_id" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "raw_response" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_payments_client_transaction_id_key" ON "subscription_payments"("client_transaction_id");

-- AddForeignKey
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
