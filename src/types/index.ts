/**
 * Koleksi type definitions dan enum untuk proyek Agung Toyota Batam.
 * Sinkron dengan model Prisma di prisma/schema.prisma.
 */

// ── Enums (mirror dari Prisma schema) ────────────────────────

export type Role = 'ADMIN' | 'SUPERADMIN';

export type CarCategory =
  | 'MPV'
  | 'SUV'
  | 'HATCHBACK'
  | 'SEDAN'
  | 'COMMERCIAL'
  | 'HYBRID_EV';

export type LeadStatus =
  | 'BARU'
  | 'DIHUBUNGI'
  | 'PROSES_KREDIT'
  | 'DEAL'
  | 'BATAL';

// ── Serialized Types (BigInt → string setelah serializeBigInt()) ─

export interface SerializedCarVariant {
  id: string;
  carModelId: string;
  name: string;
  price: string; // BigInt → string
  image: string | null;
  keyFeatures: string[];
  engineType: string | null;
  displacement: number | null;
  transmission: string | null;
  fuelType: string | null;
  maxPower: string | null;
  maxTorque: string | null;
  seatingCapacity: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedCarModel {
  id: string;
  name: string;
  slug: string;
  category: CarCategory;
  heroImage: string;
  startingPrice: string; // BigInt → string
  isPromo: boolean;
  promoLabel: string | null;
  brochurePdfUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  variants?: SerializedCarVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  carInterest: string | null;
  sourcePage: string | null;
  status: LeadStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSetting {
  id: number;
  dealershipName: string;
  dealershipAddress: string;
  googleMapsUrl: string | null;
  salesName: string;
  salesTitle: string;
  salesPhone: string;
  salesWhatsapp: string;
  salesPhotoUrl: string;
  salesBio: string | null;
  headerLogoUrl: string;
  footerLogoUrl: string;
  faviconUrl: string;
  pricelistPdfUrl: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  updatedAt: string;
}

// ── API Response Helpers ──────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
}
