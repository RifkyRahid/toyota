# 3. UI/UX, CONVERSION & ANALYTICS SPECIFICATION
**Proyek:** Website Sales Representatif Resmi – Agung Toyota Batam  
**Fokus Sistem:** Panduan Desain Visual, Komponen Mobile-First, Alur Lead Gate (Konversi), Antarmuka CMS, dan Pelacakan GA4  

---

## 1. Sistem Desain & Pedoman Visual (Design System)

Mengacu pada pedoman korporat resmi Toyota Astra Motor, antarmuka dirancang bersih, premium, dan mengutamakan keterbacaan tinggi. **Dilarang keras menggunakan tema gelap (*dark mode*) atau aksen warna neon tinggi.**

*   **Palet Warna Utama (Tailwind):**
    *   `bg-white` (`#FFFFFF`): Latar belakang utama halaman dan kartu.
    *   `bg-gray-50` (`#F8F9FA`): Latar belakang pemisah *section* (seperti profil sales atau footer atas).
    *   `text-gray-900` (`#1A1A1A`): Warna utama teks tubuh dan judul (hitam arang tajam).
    *   `text-gray-500` (`#6B7280`): Teks sekunder, deskripsi minor, dan placeholder form.
    *   `bg-red-600` (`#EB0A1E` - *Toyota Red*): Khusus untuk tombol aksi utama (*Call to Action*), *badge* "PROMO", dan label harga krusial.
*   **Tipografi & Styling:**
    *   Font standar sans-serif (Inter atau Roboto).
    *   Sudut elemen (*border-radius*) menggunakan `rounded-md` atau `rounded-lg` (tidak terlalu membulat ekstrim).
    *   Bayangan (*shadow*) menggunakan `shadow-sm` untuk kartu katalog agar terkesan rata dan modern.

---

## 2. Struktur Antarmuka Halaman Publik (Public UI)

### A. Komponen Global
*   **Sticky Navbar:** Melayang di atas dengan efek *backdrop-blur* transparan saat *scroll*. Terdapat logo di kiri, menu navigasi di tengah (disembunyikan ke *hamburger menu* pada mobile), dan tombol merah "Hubungi Sales" di kanan.
*   **Floating WhatsApp:** Ikon WhatsApp hijau statis di pojok kanan bawah layar dengan *pulse animation* halus. Selalu terlihat di setiap halaman.
*   **Footer:** Latar belakang abu-abu sangat gelap (`bg-zinc-900`). Berisi informasi diler Batam, navigasi, media sosial, logo Toyota versi monokrom (putih), dan teks *Developer Credit* berukuran kecil di paling bawah.

### B. Halaman Utama (Homepage)
1.  **Hero Slider:** Gambar *background* bersih (mobil/showroom). Teks judul promo (contoh: "Promo Merdeka Batam") dan tombol CTA ditumpuk di atas gambar menggunakan HTML (bukan teks mati di dalam gambar) untuk optimasi SEO.
2.  **Highlight Promo:** Menampilkan 2-3 kartu mobil yang memiliki status `isPromo = true` dengan pita/badge merah di sudut gambar.
3.  **Katalog Unit Dinamis:**
    *   *Desktop:* Filter tab horizontal (Semua, MPV, SUV, dll) dan kartu berjajar dalam *grid*.
    *   *Card Content:* Gambar mobil transparan (.png/.webp), nama unit tebal, "Harga OTR Mulai RpX", tombol detail, dan tombol chat WA khusus unit tersebut.
4.  **Profil Sales Representative:** Kontainer abu-abu terang. Menampilkan foto sales proporsional rasio 3:4 (Portrait), *Badge Verified*, nilai unggulan layanan (misal: "Bantu Kredit Sampai Approve"), dan 2 tombol kontak: Telepon & WA.
5.  **Blog & Promo:** Menampilkan 3-4 artikel terbaru dengan gambar sampul dan ringkasan 2 kalimat.

### C. Halaman Detail Mobil & Varian (Mobile-First)
*   **Header Produk:** Judul besar model, kategori, rentang harga dasar.
*   **Varian Selector:**
    *   *Desktop:* Menampilkan kartu setiap varian secara berdampingan.
    *   *Mobile:* Menampilkan kartu varian menggunakan **Horizontal Swipe / Carousel** agar tidak membuat halaman terlalu panjang ke bawah.
    *   *Isi Varian:* Foto sudut spesifik varian, harga aktual, dan poin-poin *Key Features*.
*   **Accordion Spesifikasi Teknis:** Detail panjang (Dimensi, Mesin, Suspensi) disembunyikan di dalam *collapsible accordion* berlabel "Lihat Spesifikasi Lengkap" agar halaman tetap bersih.
*   **Sticky Bottom Action Bar (Khusus Mobile):** Bilah statis yang muncul menempel di bagian paling bawah layar ponsel saat menggulir halaman unit. Kiri: Teks harga OTR Batam varian aktif; Kanan: Tombol merah "Tanya Unit WA".

---

## 3. Alur Konversi (Lead Gate) & Pesan WhatsApp Dinamis

### A. Lead Gate: Download Pricelist PDF
Dirancang untuk mengumpulkan nomor prospek tanpa diblokir oleh peramban (*pop-up blocker*).
1.  **Trigger:** Pengguna mengklik tombol "Download Pricelist OTR Batam 2026".
2.  **Modal Form:** Muncul pop-up meminta *Nama* dan *No. WhatsApp*.
3.  **Proses Backend:** Saat disubmit, data dikirim via `POST /api/leads`.
4.  **Sukses & Transisi UX:** 
    *   Sistem memicu fungsi `window.open(pdfUrl, '_blank')` untuk mengunduh PDF/Gambar Pricelist secara otomatis.
    *   Isi modal otomatis berubah menjadi pesan sukses dengan satu tombol aksi raksasa: **"Lanjut Chat dengan Sales di WhatsApp"**.

### B. Context-Aware WhatsApp Routing
Format pesan dihasilkan secara dinamis berdasarkan lokasi tombol yang ditekan (URL di-encode):
*   **Dari Katalog Unit:** `https://wa.me/628xxx?text=Halo Agung Toyota Batam, saya tertarik informasi dan promo untuk unit *All New Avanza* tipe *1.5 G CVT* OTR Batam.`
*   **Dari Lead Gate Pricelist:** `...text=Halo, saya [Nama], baru saja mengunduh lembar Pricelist OTR Batam. Saya ingin konsultasi lebih lanjut.`
*   **Dari Floating Button Umum:** `...text=Halo Agung Toyota Batam, saya ingin konsultasi rencana pembelian mobil Toyota.`

---

## 4. Antarmuka CMS Admin (Dashboard UX)

### A. Manajemen Katalog & Bulk Price
*   **Form Fitur Varian (Tag/Pills Input):** Admin tidak menggunakan *textarea* panjang, melainkan menekan tombol *Enter* setelah mengetik satu fitur (contoh: "Lampu LED" [Enter]) untuk membuat kotak/pil. Ini menjamin format *bullet points* di tampilan publik tidak rusak.
*   **Bulk Price Editor:** Halaman khusus menampilkan tabel seluruh varian mobil (`CarVariant`). Terdapat kolom input harga OTR berbentuk angka. Admin dapat mengubah banyak harga sekaligus dan menyimpannya melalui satu klik tombol "Simpan Semua Harga" (`PUT /api/cars/bulk-price`).

### B. Manajemen Editor
*   **Blog (Tiptap):** Editor teks *rich-text* bersih dengan toolbar minimalis (Bold, Italic, H2, H3, Bullet List). Terintegrasi dengan uploader gambar yang memanggil `/api/upload`.

### C. Laporan Leads
*   Tabel interaktif menggunakan shadcn/ui Data Table (Paginasi, Pencarian Nama).
*   Memiliki tombol hijau di pojok kanan atas: **"Export to Excel"** (memicu generasi file `.xlsx`).

---

## 5. Integrasi Pelacakan GA4 & CMS Analytics Dashboard

### A. Pemasangan Event Tracking (Sisi Klien Publik)
Komponen GA4 dipasang di `src/app/layout.tsx`. Setiap interaksi krusial akan mengirim *Custom Event* ke Google Analytics:
1.  **Melihat Detail Unit (`view_car_detail`):**
    *   Trigger: Saat halaman `/mobil/[slug]` dimuat.
    *   Parameter: `car_name`, `category`, `price_starting`.
2.  **Klik WhatsApp (`click_to_wa`):**
    *   Trigger: Semua klik pada tombol/tautan WhatsApp.
    *   Parameter: `source_button` (contoh: "floating", "car_detail", "lead_gate_success").
3.  **Unduh Pricelist (`download_pricelist`):**
    *   Trigger: Saat form Lead Gate berhasil disubmit.

### B. Widget Analitik di Dashboard CMS Admin
Dasbor utama tidak kosong, melainkan menampilkan metrik visual yang ditarik menggunakan Google Analytics Data API (`/api/analytics`):
1.  **Top 10 Mobil Terpopuler (Tabel):**
    Menampilkan daftar unit yang paling sering dilihat berdasarkan *event* `view_car_detail`, diurutkan secara menurun (*descending*).
2.  **Grafik Jam Sibuk / Peak Hours (Bar Chart):**
    Menggunakan `react-chartjs-2` atau `recharts` untuk memvisualisasikan jumlah pengguna aktif berdasarkan dimensi `hour` (Pukul 00:00 hingga 23:00). Berfungsi sebagai panduan *sales* untuk efisiensi jadwal tayang Google Ads (*Dayparting*).
3.  **Summary Cards (Ringkasan KPI):**
    3 kotak angka raksasa di atas dasbor: "Total Prospek Bulan Ini (Database)", "Total Klik WhatsApp (GA4)", dan "Mobil Paling Diminati Saat Ini".

### C. Ekspor Laporan Bulanan (PDF)
*   **Fitur:** Tombol khusus "Download Laporan Performa (PDF)" di dasbor analitik CMS.
*   **Mekanisme (`jsPDF`):** 
    Sistem akan "memotret" tabel 10 Unit Terpopuler, Grafik Peak Hours, dan daftar 15 *Leads* terbaru, lalu merangkainya ke dalam PDF dokumen resmi ber-kop "Laporan Kinerja Digital Agung Toyota Batam", siap dikirim via WhatsApp atau dicetak oleh *sales*.