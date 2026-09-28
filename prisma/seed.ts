import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai seed database...');

  // 1. Akun Superadmin Default
  const hashedPassword = await bcrypt.hash('AdminAgung2026!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@agungtoyotabatam.com' },
    update: {},
    create: {
      name: 'Admin Agung Toyota',
      email: 'admin@agungtoyotabatam.com',
      password: hashedPassword,
      role: Role.SUPERADMIN,
    },
  });
  console.log(`✅ Akun Superadmin: ${admin.email}`);

  // 2. Inisialisasi Pengaturan Diler & Profil Sales Default (Singleton row id=1)
  const settings = await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      dealershipName: 'Agung Toyota Batam',
      dealershipAddress: 'Jl. Yos Sudarso, Batu Ampar, Kota Batam, Kepulauan Riau',
      googleMapsUrl: null,
      salesName: 'Official Sales Representative',
      salesTitle: 'Certified Sales Executive',
      salesPhone: '0812XXXXXXXX',
      salesWhatsapp: '62812XXXXXXXX',
      salesPhotoUrl: '/images/sales-default.webp',
      salesBio: null,
      headerLogoUrl: '/images/toyota-logo.webp',
      footerLogoUrl: '/images/toyota-logo-white.webp',
      faviconUrl: '/favicon.ico',
      pricelistPdfUrl: '/uploads/pricelist-batam-2026.pdf',
      instagramUrl: null,
      facebookUrl: null,
      tiktokUrl: null,
    },
  });
  console.log(`✅ SiteSetting (id=${settings.id}): ${settings.dealershipName}`);

  console.log('\n🎉 Seed database berhasil dijalankan.');
  console.log('─────────────────────────────────────────');
  console.log('⚠️  PENTING: Segera ganti kredensial default di bawah ini:');
  console.log('   Email    : admin@agungtoyotabatam.com');
  console.log('   Password : AdminAgung2026!');
  console.log('─────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
