# 1. ARCHITECTURE & TECH STACK SPECIFICATION
**Proyek:** Website Sales Representatif Resmi – Agung Toyota Batam  
**Target Rilis:** 2026  
**Fokus Sistem:** Web Katalog Unit Baru, Konversi Prospek (Lead Generation), CMS Admin, dan Pelacakan GA4  

---

## 1. Core Tech Stack & Libraries

| Kategori | Teknologi | Kegunaan Spesifik |
| :--- | :--- | :--- |
| **Framework** | Next.js 14+ (App Router) | Server-Side Rendering (SSR), Server Actions / Route Handlers, SEO Optimization |
| **Bahasa** | TypeScript | Type safety pada relasi model katalog, data leads, dan respons API |
| **Database** | PostgreSQL | Penyimpanan relasional katalog unit, varian, blog, dan data leads |
| **ORM** | Prisma ORM | Manajemen skema database, migrasi, dan type-safe database client |
| **Styling** | Tailwind CSS + shadcn/ui | Desain korporat bersih mengacu pada Toyota Astra Motor (non-neon) |
| **Animasi** | Framer Motion | Transisi katalog, interaksi kartu mobil, dan animasi modal |
| **Notifikasi** | Sonner | Toast notification modern untuk feedback form admin & client |
| **Image Engine** | Sharp | Pemrosesan upload: resize batas dimensi, konversi otomatis ke `.webp` kualitas 80% |
| **Rich Text Editor** | Tiptap (Headless) | Editor WYSIWYG untuk pembuatan blog dan artikel promo lokal |
| **Keamanan Konten** | isomorphic-dompurify | Sanitasi payload HTML dari editor Tiptap untuk mencegah serangan XSS |
| **Tracking Publik** | `@next/third-parties/google` | Integrasi bawaan Google Analytics 4 (GA4) |
| **Analytics API** | `@google-analytics/data` | Penarikan metrik GA4 (Top 10 Cars, Peak Hours) ke CMS Admin |
| **Export Engine** | `xlsx` + `jspdf` & `jspdf-autotable` | Ekspor data leads ke Excel dan pembuatan laporan performa bulanan PDF |

---

## 2. Struktur Direktori Proyek

Aplikasi menggunakan konvensi Next.js App Router dengan pemisahan tegas antara area publik, area proteksi admin, dan API handler.

agung-toyota-batam/
├── docs/
│   ├── 1_ARCHITECTURE_STACK.md
│   ├── 2_DATABASE_SCHEMA.md
│   └── 3_UI_UX_FEATURES.md
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   ├── images/                # Asset statis diler (logo resmi, placeholder default)
│   └── uploads/               # Target simpan upload gambar (khusus local development)
├── src/
│   ├── app/
│   │   ├── (public)/          # Route Group: Halaman Publik Pengunjung
│   │   │   ├── layout.tsx     # Root public layout (Navbar sticky, Footer, Floating WA)
│   │   │   ├── page.tsx       # Beranda (Hero, Promo, Tab Katalog, Sales Profile, Blog)
│   │   │   ├── mobil/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx # Halaman detail mobil, pilihan varian, & spesifikasi
│   │   │   ├── daftar-harga/
│   │   │   │   └── page.tsx   # Halaman daftar harga OTR Batam & download pricelist sheet
│   │   │   ├── promo/
│   │   │   │   ├── page.tsx   # Arsip blog promo & artikel tips
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx # Detail artikel blog
│   │   │   └── sales/
│   │   │       └── page.tsx   # Profil lengkap sales, kredibilitas, & kontak langsung
│   │   │
│   │   ├── admin/             # Route Group: CMS Dashboard (Terproteksi Cookie Sesi)
│   │   │   ├── login/
│   │   │   │   └── page.tsx   # Halaman login admin (Unauthenticated)
│   │   │   ├── layout.tsx     # Guard layout admin (Sidebar CMS, auto-logout monitor)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx   # Dasbor utama: Ringkasan leads & analitik GA4 (Peak Hours)
│   │   │   ├── katalog/
│   │   │   │   ├── page.tsx   # Daftar unit mobil (CRUD Model)
│   │   │   │   ├── tambah/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── bulk-price/
│   │   │   │   └── page.tsx   # Tabel cepat ubah massal harga OTR Batam semua varian
│   │   │   ├── leads/
│   │   │   │   └── page.tsx   # Rekap tabel data prospek + tombol "Export to Excel"
│   │   │   ├── banner/
│   │   │   │   └── page.tsx   # Manajemen hero banner carousel
│   │   │   ├── blog/
│   │   │   │   └── page.tsx   # Manajemen artikel SEO via Tiptap
│   │   │   └── settings/
│   │   │       └── page.tsx   # Update data sales, kontak WA, logo, & upload file pricelist PDF
│   │   │
│   │   └── api/               # API Route Handlers (Akses database Prisma eksklusif)
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── logout/route.ts
│   │       │   └── me/route.ts
│   │       ├── cars/
│   │       │   ├── route.ts
│   │       │   ├── [id]/route.ts
│   │       │   └── bulk-price/route.ts
│   │       ├── leads/
│   │       │   ├── route.ts
│   │       │   └── export/route.ts
│   │       ├── upload/
│   │       │   └── route.ts   # Pipeline upload sharp (JPG/PNG -> WebP)
│   │       ├── analytics/
│   │       │   └── route.ts   # Proxy endpoint penarik data GA4 API
│   │       └── settings/
│   │           └── route.ts
│   │
│   ├── components/
│   │   ├── public/            # Komponen halaman pengunjung
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── FloatingWhatsApp.tsx
│   │   │   ├── HeroSlider.tsx
│   │   │   ├── CarCard.tsx
│   │   │   ├── VariantSelector.tsx
│   │   │   ├── SpecAccordion.tsx
│   │   │   ├── LeadModal.tsx  # Pop-up gate download pricelist
│   │   │   └── MobileBottomBar.tsx # Sticky bar harga & WA di layar HP
│   │   ├── admin/             # Komponen dashboard CMS
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TiptapEditor.tsx
│   │   │   ├── TagInput.tsx   # Pills input untuk fitur varian
│   │   │   ├── BulkPriceTable.tsx
│   │   │   └── AnalyticsChart.tsx # Visualisasi grafik peak hours & 10 top cars
│   │   └── ui/                # Base UI shadcn (Button, Dialog, Table, Tabs, Input)
│   │
│   ├── lib/
│   │   ├── prisma.ts          # Singleton PrismaClient instance
│   │   ├── auth.ts            # Helper verifikasi JWT & cookie sesi
│   │   ├── analytics.ts       # Setup Google Analytics Data API client
│   │   └── rate-limiter.ts    # In-memory / cache rate limiter proteksi brute-force
│   │
│   ├── types/
│   │   └── index.ts           # Definisi TypeScript interface & enum
│   └── middleware.ts          # Edge middleware: Route protection /admin/*

---

## 3. Strategi Penyimpanan File & Nginx Pipeline

Untuk menjamin file gambar tidak terhapus saat Next.js di-*build* ulang di VPS:

### A. Environment Variable (`.env`)
*   **Lokal (`.env.local`):**
    ```env
    UPLOAD_DESTINATION="./public/uploads"
    NEXT_PUBLIC_BASE_URL="http://localhost:3000"
    ```
*   **Production VPS (`.env.production`):**
    ```env
    UPLOAD_DESTINATION="/var/www/agung-toyota-media"
    NEXT_PUBLIC_BASE_URL="[https://agungtoyotabatam.com](https://agungtoyotabatam.com)"
    ```

### B. Sharp Processing Pipeline (`/api/upload/route.ts`)
Semua berkas gambar yang diunggah diproses melalui langkah berikut:
1. Memvalidasi *MIME Type* (hanya menerima `image/jpeg`, `image/png`, `image/webp`).
2. Validasi buffer menggunakan pustaka `sharp` untuk menangkal berkas skrip berbahaya yang disamarkan.
3. Mengubah ukuran (*resize*) proporsional: batas lebar maksimal **1920px** untuk Banner dan **1080px** untuk foto Unit Mobil.
4. Mengonversi format ke **`.webp`** dengan parameter `quality: 80`.
5. Menyimpan file ke `process.env.UPLOAD_DESTINATION` dengan penamaan acak unik berbasis timestamp (`Date.now()-[hash].webp`).
6. Mengembalikan URL relatif standar: `/uploads/[filename].webp`.

### C. Konfigurasi Nginx di Production Server
Nginx bertindak sebagai *reverse proxy* dan melayani file statis secara langsung tanpa menyentuh Node.js:

```nginx
# Melayani berkas upload gambar langsung dari disk persisten
location /uploads/ {
    alias /var/www/agung-toyota-media/;
    expires 30d;
    add_header Cache-Control "public, no-transform";
    access_log off;
}

# Melempar aplikasi Next.js ke PM2
location / {
    proxy_pass [http://127.0.0.1:3000](http://127.0.0.1:3000);
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

4. Keamanan & Kebijakan Autentikasi
Sesi Admin Berbasis Cookie Terproteksi:

Token sesi disimpan di dalam Cookie dengan atribut: httpOnly=true, Secure=true (pada mode HTTPS), SameSite=Strict, dan Path=/.

Skrip sisi klien (JavaScript/XSS) sama sekali tidak memiliki akses ke cookie ini.

Next.js Edge Middleware (middleware.ts):

Setiap request ke path /admin/* (kecuali /admin/login) diverifikasi di tingkat edge.

Jika cookie sesi tidak valid atau hilang, pengguna langsung dialihkan (redirect 307) ke /admin/login.

Proteksi Serangan Brute-Force:

Endpoint POST /api/auth/login dibatasi dengan Rate Limiter.

Maksimal 5 percobaan gagal per alamat IP. Jika dilanggar, IP dibekukan selama 15 menit.

Inactivity Auto-Logout:

Token sesi memiliki masa aktif maksimal 60 menit.

Di sisi klien dasbor admin, terdapat idle listener (mendeteksi mousemove, keydown, mousedown). Jika tidak ada aktivitas selama 60 menit, sistem menghapus sesi lokal dan me-redirect admin keluar.

Sanitasi Konten XSS:

Data HTML artikel blog yang dibuat dari Tiptap wajib melewati pembersihan DOMPurify.sanitize() di sisi server sebelum dirender atau disimpan.

5. Strategi Caching & Revalidasi Data
Penyegaran Sisi Publik (On-Demand Revalidation):

Halaman publik menggunakan Incremental Static Regeneration (ISR) agar muat sangat cepat.

Ketika admin melakukan aksi CRUD di CMS (tambah mobil, ubah harga di Bulk Price, ubah banner, terbitkan blog), API Handler terkait wajib memanggil fungsi revalidasi:

TypeScript
import { revalidatePath } from 'next/cache';
// Contoh saat harga diupdate:
revalidatePath('/');
revalidatePath('/daftar-harga');
revalidatePath(`/mobil/${carSlug}`);
Database Access Pattern:

Tidak ada pemanggilan kueri Prisma langsung di dalam Client Components.

Semua interaksi tulis/baca database dilakukan di dalam Server Components atau API Route Handlers (src/app/api/...).


---
