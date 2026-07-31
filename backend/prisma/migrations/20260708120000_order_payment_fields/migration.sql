-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed');

-- AlterTable
ALTER TABLE "orders"
ADD COLUMN "payment_status" "PaymentStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN "payment_txn_id" TEXT,
ADD COLUMN "payment_ref" TEXT,
ADD COLUMN "paid_at" TIMESTAMP(3);
