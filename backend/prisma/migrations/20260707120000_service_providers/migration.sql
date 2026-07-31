-- AlterTable
ALTER TABLE "service_categories" ADD COLUMN IF NOT EXISTS "subtitle" TEXT;

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_service_id_fkey";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "service_id";
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "provider_id" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "package_id" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "total_amount" DECIMAL(10,2);

-- DropTable
DROP TABLE IF EXISTS "services";

-- CreateTable
CREATE TABLE IF NOT EXISTS "service_providers" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "image_url" TEXT,
    "location" TEXT,
    "distance_km" DECIMAL(6,2),
    "rating" DECIMAL(2,1),
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "audience_tag" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "price_from" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_providers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "service_packages" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price_min" DECIMAL(10,2) NOT NULL,
    "price_max" DECIMAL(10,2),
    "duration_minutes" INTEGER NOT NULL DEFAULT 60,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_packages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "service_provider_images" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "service_provider_images_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "service_package_images" (
    "id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "service_package_images_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "service_provider_time_slots" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "slot_time" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "service_provider_time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "service_providers_slug_key" ON "service_providers"("slug");
CREATE INDEX IF NOT EXISTS "service_providers_category_id_is_active_idx" ON "service_providers"("category_id", "is_active");
CREATE INDEX IF NOT EXISTS "service_packages_provider_id_is_active_idx" ON "service_packages"("provider_id", "is_active");
CREATE INDEX IF NOT EXISTS "service_provider_images_provider_id_sort_order_idx" ON "service_provider_images"("provider_id", "sort_order");
CREATE INDEX IF NOT EXISTS "service_package_images_package_id_sort_order_idx" ON "service_package_images"("package_id", "sort_order");
CREATE UNIQUE INDEX IF NOT EXISTS "service_provider_time_slots_provider_id_slot_time_key" ON "service_provider_time_slots"("provider_id", "slot_time");
CREATE INDEX IF NOT EXISTS "service_provider_time_slots_provider_id_sort_order_idx" ON "service_provider_time_slots"("provider_id", "sort_order");
CREATE INDEX IF NOT EXISTS "bookings_provider_id_booking_date_booking_time_idx" ON "bookings"("provider_id", "booking_date", "booking_time");

-- AddForeignKey
ALTER TABLE "service_providers" ADD CONSTRAINT "service_providers_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "service_packages" ADD CONSTRAINT "service_packages_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "service_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "service_provider_images" ADD CONSTRAINT "service_provider_images_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "service_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "service_package_images" ADD CONSTRAINT "service_package_images_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "service_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "service_provider_time_slots" ADD CONSTRAINT "service_provider_time_slots_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "service_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "service_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "service_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
