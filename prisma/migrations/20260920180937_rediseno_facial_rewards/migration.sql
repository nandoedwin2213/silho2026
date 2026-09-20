-- CreateEnum
CREATE TYPE "PointsReason" AS ENUM ('WEB_BOOKING_PAID', 'PROTOCOL_COMPLETED', 'PUNCTUAL_ATTENDANCE', 'REFERRAL', 'FOLLOW_UP', 'ANNIVERSARY', 'REDEMPTION', 'ADJUSTMENT', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RewardTier" AS ENUM ('ESSENTIAL', 'GOLD', 'BLACK');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "intake" JSONB,
ADD COLUMN     "objective" TEXT,
ADD COLUMN     "promo_code" TEXT;

-- AlterTable
ALTER TABLE "before_afters" ADD COLUMN     "evolution" TEXT,
ADD COLUMN     "goal" TEXT,
ADD COLUMN     "problem" TEXT,
ADD COLUMN     "route_slug" TEXT,
ADD COLUMN     "sessions" TEXT,
ADD COLUMN     "techniques" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "channel" TEXT NOT NULL DEFAULT 'WEB',
ADD COLUMN     "points_discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "points_redeemed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referral_code" TEXT;

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "birth_date" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "patient_accounts" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "referral_code" TEXT NOT NULL,
    "referred_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_transactions" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" "PointsReason" NOT NULL,
    "description" TEXT NOT NULL,
    "order_id" TEXT,
    "appointment_id" TEXT,
    "expires_at" TIMESTAMP(3),
    "expired_handled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "points_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "points_cost" INTEGER NOT NULL,
    "min_tier" "RewardTier" NOT NULL DEFAULT 'ESSENTIAL',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_accounts_patient_id_key" ON "patient_accounts"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_accounts_email_key" ON "patient_accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patient_accounts_referral_code_key" ON "patient_accounts"("referral_code");

-- CreateIndex
CREATE INDEX "points_transactions_patient_id_idx" ON "points_transactions"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "rewards_slug_key" ON "rewards"("slug");

-- AddForeignKey
ALTER TABLE "patient_accounts" ADD CONSTRAINT "patient_accounts_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_transactions" ADD CONSTRAINT "points_transactions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
