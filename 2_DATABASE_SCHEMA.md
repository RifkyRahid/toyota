# 2. DATABASE SCHEMA & DATA FLOW SPECIFICATION
**Proyek:** Website Sales Representatif Resmi – Agung Toyota Batam  
**Database:** PostgreSQL  
**ORM:** Prisma ORM  
**Fokus Sistem:** Relasi Katalog (Parent-Child), Pipeline Prospek (Leads), Manajemen Konten (CMS), dan Integritas Transaksi Data  

---

## 1. Diagram Relasi Entitas (ERD Overview)

   ┌────────────────┐
   │   SiteSetting  │ (Singleton: Identitas Diler, Profil Sales, File Pricelist)
   └────────────────┘

   ┌────────────────┐         1 : N         ┌─────────────────┐
   │    CarModel    ├───────────────────────┤   CarVariant    │
   │ (Parent Mobil) │                       │  (Tipe & Harga) │
   └────────────────┘                       └─────────────────┘
                                                     │ (Referensi Nama Unit)
                                                     ▼
   ┌────────────────┐                       ┌─────────────────┐
   │      User      │                       │      Lead       │
   │ (Admin Akun)   │                       │ (Data Prospek)  │
   └────────────────┘                       └─────────────────┘

   ┌────────────────┐                       ┌─────────────────┐
   │     Banner     │                       │      Blog       │
   │ (Hero Promo)   │                       │ (Artikel SEO)   │
   └────────────────┘                       └─────────────────┘

   ---

## 2. Skema Lengkap `prisma/schema.prisma`

Salin dan gunakan skema berikut sebagai acuan utama file `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ------------------------------------------------------
// ENUMS
// ------------------------------------------------------

enum Role {
  ADMIN
  SUPERADMIN
}

enum CarCategory {
  MPV
  SUV
  HATCHBACK
  SEDAN
  COMMERCIAL
  HYBRID_EV
}

enum LeadStatus {
  BARU
  DIHUBUNGI
  PROSES_KREDIT
  DEAL
  BATAL
}

// ------------------------------------------------------
// 1. AUTENTIKASI ADMIN
// ------------------------------------------------------

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   // Hashed using bcrypt / argon2
  role      Role     @default(ADMIN)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

// ------------------------------------------------------
// 2. KATALOG MOBIL (PARENT - CHILD RELATION)
// ------------------------------------------------------

model CarModel {
  id             String       @id @default(cuid())
  name           String       // Contoh: "All New Kijang Innova Zenix"
  slug           String       @unique // Contoh: "innova-zenix-batam" (SEO-friendly)
  category       CarCategory  @default(MPV)
  heroImage      String       // Path gambar transparan utama (/uploads/...)
  startingPrice  BigInt       // Cache harga terendah untuk query sorting/filter cepat
  isPromo        Boolean      @default(false) // Toggle badge "PROMO BULAN INI"
  promoLabel     String?      // Contoh: "DP Ringan 15 Juta" atau "Bunga 0%"
  brochurePdfUrl String?      // Path file spesifikasi PDF khusus model ini
  displayOrder   Int          @default(0) // Urutan tampilan di homepage
  isActive       Boolean      @default(true)
  
  // Relasi ke Varian Tipe (Child)
  variants       CarVariant[]

  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@index([category, isActive])
  @@index([isPromo])
  @@map("car_models")
}

model CarVariant {
  id             String   @id @default(cuid())
  carModelId     String
  carModel       CarModel @relation(fields: [carModelId], references: [id], onDelete: Cascade)
  
  name           String   // Contoh: "2.0 G CVT", "2.0 V CVT", "2.0 Q HV Modellista"
  price          BigInt   // Harga OTR Batam aktual (Angka penuh, misal: 437700000)
  image          String?  // Foto sudut khusus tipe ini (opsional, fallback ke heroImage)
  
  // Fitur Unggulan (Pills / Tag Input)
  keyFeatures    String[] // Contoh: ["LED Headlamp", "10 inch Head Unit", "Electric Parking Brake"]
  
  // Spesifikasi Teknis Terperinci (Accordion Collapsible)
  engineType     String?  // Contoh: "M20A-FKS 4 Silinder Segaris 16 Katup DOHC"
  displacement   Int?     // Kapasitas Mesin (cc), misal: 1987
  transmission   String?  // Contoh: "CVT 10-Speed Luxury"
  fuelType       String?  // Contoh: "Bensin" / "Bensin + Hybrid Electric"
  maxPower       String?  // Contoh: "174 PS / 6600 rpm"
  maxTorque      String?  // Contoh: "20.9 Kgm / 4500-4900 rpm"
  seatingCapacity Int?    // Kapasitas Penumpang (misal: 7 atau 8)

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([carModelId])
  @@map("car_variants")
}

// ------------------------------------------------------
// 3. LEAD GENERATION (PROSPEK DARI LEAD GATE)
// ------------------------------------------------------

model Lead {
  id          String     @id @default(cuid())
  name        String     // Nama Calon Pembeli
  whatsapp    String     // Nomor WhatsApp (Format: 08xx atau 628xx)
  carInterest String?    // Unit yang diminati (misal: "Innova Zenix")
  sourcePage  String?    // URL/Section tempat form di-submit
  status      LeadStatus @default(BARU)
  notes       String?    // Catatan internal sales setelah follow-up
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([status])
  @@index([createdAt])
  @@map("leads")
}

// ------------------------------------------------------
// 4. KONTEN MARKETING (BANNER & BLOG SEO)
// ------------------------------------------------------

model Banner {
  id           String   @id @default(cuid())
  title        String   // Judul Promo (HTML Overlay, bukan gambar mati)
  subtitle     String?  // Subjudul / Keterangan Singkat
  ctaText      String   @default("Minta Penawaran")
  ctaUrl       String   // Tautan tujuan (bisa anchor #katalog atau link WA)
  imageUrl     String   // Background image banner (/uploads/...)
  displayOrder Int      @default(0)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("banners")
}

model Blog {
  id          String   @id @default(cuid())
  title       String   // Judul Artikel
  slug        String   @unique // Contoh: "daftar-harga-toyota-batam-2026"
  excerpt     String   // Ringkasan 1-2 kalimat untuk kartu depan & meta-description
  content     String   // Payload HTML dari Tiptap (wajib disanitasi)
  coverImage  String   // Gambar sampul artikel
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
  @@index([isPublished, createdAt])
  @@map("blogs")
}

// ------------------------------------------------------
// 5. SITE SETTINGS & PROFIL SALES (SINGLETON ROW)
// ------------------------------------------------------

model SiteSetting {
  id              Int      @id @default(1) // Selalu bernilai 1 (Tabel 1 baris)
  dealershipName  String   @default("Agung Toyota Batam")
  dealershipAddress String // Alamat lengkap showroom di Batam
  googleMapsUrl   String?  // Link peta showroom
  
  // Data Profil Sales Representative
  salesName       String   // Nama Sales
  salesTitle      String   @default("Certified Sales Executive")
  salesPhone      String   // Nomor kontak telepon
  salesWhatsapp   String   // Nomor WhatsApp aktif (format internasional: 628xxx)
  salesPhotoUrl   String   // Foto portrait resmi (rasio 3:4)
  salesBio        String?  // Slogan atau nilai jual (misal: "Bantu kredit sampai approved")
  
  // Aset Brand & File Penting
  headerLogoUrl   String   // Logo resmi di Navbar
  footerLogoUrl   String   // Logo monokrom di Footer
  faviconUrl      String   // Icon tab browser
  pricelistPdfUrl String   // File PDF/Gambar lembar harga OTR Batam terbaru
  
  // Social Media Link
  instagramUrl    String?
  facebookUrl     String?
  tiktokUrl       String?

  updatedAt       DateTime @updatedAt

  @@map("site_settings")
}

A. Implementasi Bulk Price Update (/api/cars/bulk-price/route.ts)
Gunakan transaksi database agar bila terjadi kegagalan koneksi di tengah pembaruan, seluruh perubahan dibatalkan secara aman:

TypeScript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function PUT(req: Request) {
  try {
    const updates: { id: string; price: number }[] = await req.json();

    // Eksekusi update massal dalam satu transaksi atomik
    await prisma.$transaction(
      updates.map((item) =>
        prisma.carVariant.update({
          where: { id: item.id },
          data: { price: BigInt(item.price) },
        })
      )
    );

    // Otomatis sinkronisasi startingPrice di CarModel
    const affectedModels = await prisma.carVariant.findMany({
      where: { id: { in: updates.map((u) => u.id) } },
      select: { carModelId: true },
      distinct: ['carModelId'],
    });

    for (const { carModelId } of affectedModels) {
      const minPrice = await prisma.carVariant.aggregate({
        where: { carModelId },
        _min: { price: true },
      });
      if (minPrice._min.price) {
        await prisma.carModel.update({
          where: { id: carModelId },
          data: { startingPrice: minPrice._min.price },
        });
      }
    }

    // Refresh cache halaman publik
    revalidatePath('/');
    revalidatePath('/daftar-harga');

    return NextResponse.json({ message: 'Harga OTR berhasil diperbarui' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui harga' }, { status: 500 });
  }
}

B. Manajemen Prospek (Lead Gate System)

Method,Endpoint,Fungsi Database,Payload Utama
POST,/api/leads,prisma.lead.create(),"{ name, whatsapp, carInterest, sourcePage }"
GET,/api/leads,prisma.lead.findMany() terurut createdAt desc,Filter status / pencarian nama
PATCH,/api/leads/[id],prisma.lead.update() (ubah status / tambah notes),"{ status, notes }"
GET,/api/leads/export,Menarik data lead dan menghasilkan file Excel (xlsx),Parameter rentang tanggal

C. Banner, Blog, & Site Settings

Method,Endpoint,Fungsi Database,Tindakan Cache
GET/POST,/api/banners,CRUD Banner slide promosi,revalidatePath('/')
GET/POST,/api/blogs,CRUD Blog & artikel tips lokal,revalidatePath('/promo')
GET/PUT,/api/settings,prisma.siteSetting.upsert({ where: { id: 1 } }),"revalidatePath('/', 'layout')"

4. Penanganan Tipe Data Khusus (BigInt Serialization)
Karena harga mobil bernilai ratusan juta hingga miliaran rupiah, tipe data di PostgreSQL menggunakan BigInt. Masalah bawaan JavaScript adalah JSON.stringify() tidak dapat memproses nilai BigInt secara langsung.

Solusi Wajib: Helper Serializer JSON (src/lib/serialize.ts)
Terapkan serializer sebelum mengembalikan response ke klien:

export function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

Gunakan di route handler:

const cars = await prisma.carModel.findMany({ include: { variants: true } });
return NextResponse.json(serializeBigInt(cars));

5. Seed Awal Data Database (prisma/seed.ts)
File ini wajib dijalankan pertama kali (npx prisma db seed) untuk membuat akun admin default dan menginisialisasi baris pengaturan diler tunggal (singleton):

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Akun Admin Default
  const hashedPassword = await bcrypt.hash('AdminAgung2026!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@agungtoyotabatam.com' },
    update: {},
    create: {
      name: 'Admin Agung Toyota',
      email: 'admin@agungtoyotabatam.com',
      password: hashedPassword,
      role: Role.SUPERADMIN,
    },
  });

  // 2. Inisialisasi Pengaturan Diler & Profil Sales Default
  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      dealershipName: 'Agung Toyota Batam',
      dealershipAddress: 'Jl. Yos Sudarso, Batu Ampar, Kota Batam, Kepulauan Riau',
      salesName: 'Official Sales Representative',
      salesTitle: 'Certified Sales Executive',
      salesPhone: '0812XXXXXXXX',
      salesWhatsapp: '62812XXXXXXXX',
      salesPhotoUrl: '/images/sales-default.webp',
      headerLogoUrl: '/images/toyota-logo.webp',
      footerLogoUrl: '/images/toyota-logo-white.webp',
      faviconUrl: '/favicon.ico',
      pricelistPdfUrl: '/uploads/pricelist-batam-2026.pdf',
    },
  });

  console.log('Seed database berhasil dijalankan.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });