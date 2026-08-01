-- OrderStatus: add shipped
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'shipped' AFTER 'processing';

-- PaymentStatus: add refunded
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'refunded' AFTER 'failed';

-- CreateEnums (safe if re-run after a failed migrate)
DO $$ BEGIN
  CREATE TYPE "CouponDiscountType" AS ENUM ('percent', 'fixed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "NotificationType" AS ENUM ('order', 'booking', 'payment', 'general');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ReviewTargetType" AS ENUM ('product', 'service');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentMethod" AS ENUM ('cod', 'online');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- User: password-reset OTP columns
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_otp_hash" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_otp_expires_at" TIMESTAMP(3);

-- Addresses (missing from init / all earlier migrations)
CREATE TABLE IF NOT EXISTS "addresses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'Home',
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "addresses_user_id_is_default_idx" ON "addresses"("user_id", "is_default");

DO $$ BEGIN
  ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Order columns
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_method" "PaymentMethod" NOT NULL DEFAULT 'online';
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "coupon_code" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tracking_id" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_address" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "contact_phone" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "cancel_reason" TEXT;

-- Booking columns
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "booking_number" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "payment_method" "PaymentMethod" NOT NULL DEFAULT 'online';
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "payment_status" "PaymentStatus" NOT NULL DEFAULT 'pending';
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "payment_txn_id" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "payment_ref" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "paid_at" TIMESTAMP(3);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "contact_phone" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "alternate_phone" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "cancel_reason" TEXT;

UPDATE "bookings"
SET "booking_number" = 'BKG-' || SUBSTRING("id"::text, 1, 8)
WHERE "booking_number" IS NULL;

ALTER TABLE "bookings" ALTER COLUMN "booking_number" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "bookings_booking_number_key" ON "bookings"("booking_number");

-- Wishlist
CREATE TABLE IF NOT EXISTS "wishlist_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "wishlist_items_user_id_product_id_key"
  ON "wishlist_items"("user_id", "product_id");

DO $$ BEGIN
  ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Coupons
CREATE TABLE IF NOT EXISTS "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discount_type" "CouponDiscountType" NOT NULL,
    "discount_value" DECIMAL(10,2) NOT NULL,
    "min_order_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "coupons_code_key" ON "coupons"("code");

-- Reviews
CREATE TABLE IF NOT EXISTS "reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_type" "ReviewTargetType" NOT NULL,
    "product_id" TEXT,
    "provider_id" TEXT,
    "order_id" TEXT,
    "booking_id" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "reviews_user_id_product_id_order_id_key"
  ON "reviews"("user_id", "product_id", "order_id");

CREATE UNIQUE INDEX IF NOT EXISTS "reviews_user_id_provider_id_booking_id_key"
  ON "reviews"("user_id", "provider_id", "booking_id");

CREATE INDEX IF NOT EXISTS "reviews_product_id_idx" ON "reviews"("product_id");
CREATE INDEX IF NOT EXISTS "reviews_provider_id_idx" ON "reviews"("provider_id");

DO $$ BEGIN
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_provider_id_fkey"
    FOREIGN KEY ("provider_id") REFERENCES "service_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_fkey"
    FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Notifications
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "notifications_user_id_created_at_idx"
  ON "notifications"("user_id", "created_at");

DO $$ BEGIN
  ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;