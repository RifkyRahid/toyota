-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "CarCategory" AS ENUM ('MPV', 'SUV', 'HATCHBACK', 'SEDAN', 'COMMERCIAL', 'HYBRID_EV');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('BARU', 'DIHUBUNGI', 'PROSES_KREDIT', 'DEAL', 'BATAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "car_models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "CarCategory" NOT NULL DEFAULT 'MPV',
    "heroImage" TEXT NOT NULL,
    "startingPrice" BIGINT NOT NULL,
    "isPromo" BOOLEAN NOT NULL DEFAULT false,
    "promoLabel" TEXT,
    "brochurePdfUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "car_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "car_variants" (
    "id" TEXT NOT NULL,
    "carModelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "image" TEXT,
    "keyFeatures" TEXT[],
    "engineType" TEXT,
    "displacement" INTEGER,
    "transmission" TEXT,
    "fuelType" TEXT,
    "maxPower" TEXT,
    "maxTorque" TEXT,
    "seatingCapacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "car_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "carInterest" TEXT,
    "sourcePage" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'BARU',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "ctaText" TEXT NOT NULL DEFAULT 'Minta Penawaran',
    "ctaUrl" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "dealershipName" TEXT NOT NULL DEFAULT 'Agung Toyota Batam',
    "dealershipAddress" TEXT NOT NULL,
    "googleMapsUrl" TEXT,
    "salesName" TEXT NOT NULL,
    "salesTitle" TEXT NOT NULL DEFAULT 'Certified Sales Executive',
    "salesPhone" TEXT NOT NULL,
    "salesWhatsapp" TEXT NOT NULL,
    "salesPhotoUrl" TEXT NOT NULL,
    "salesBio" TEXT,
    "headerLogoUrl" TEXT NOT NULL,
    "footerLogoUrl" TEXT NOT NULL,
    "faviconUrl" TEXT NOT NULL,
    "pricelistPdfUrl" TEXT NOT NULL,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "tiktokUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "car_models_slug_key" ON "car_models"("slug");

-- CreateIndex
CREATE INDEX "car_models_category_isActive_idx" ON "car_models"("category", "isActive");

-- CreateIndex
CREATE INDEX "car_models_isPromo_idx" ON "car_models"("isPromo");

-- CreateIndex
CREATE INDEX "car_variants_carModelId_idx" ON "car_variants"("carModelId");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_createdAt_idx" ON "leads"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_key" ON "blogs"("slug");

-- CreateIndex
CREATE INDEX "blogs_slug_idx" ON "blogs"("slug");

-- CreateIndex
CREATE INDEX "blogs_isPublished_createdAt_idx" ON "blogs"("isPublished", "createdAt");

-- AddForeignKey
ALTER TABLE "car_variants" ADD CONSTRAINT "car_variants_carModelId_fkey" FOREIGN KEY ("carModelId") REFERENCES "car_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;
