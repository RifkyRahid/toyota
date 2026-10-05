import type { Metadata } from 'next';
import { Phone, MessageCircle, MapPin, Award, CheckCircle, ShieldCheck, Clock, Car } from 'lucide-react';
import { buildWaUrl } from '@/lib/format';
import { getSiteSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tentang Sales Representatif — Agung Toyota Batam',
  description: 'Konsultasi mobil Toyota resmi di Batam. Dapatkan penawaran OTR terbaik, promo diskon, dan kemudahan proses kredit.',
};

export default async function SalesPage() {
  const settings = await getSiteSettings();

  const salesName = settings.salesName || 'Sales Representatif Toyota';
  const salesTitle = settings.salesTitle || 'Certified Sales Executive';
  const salesPhone = settings.salesPhone || '';
  const salesWhatsapp = settings.salesWhatsapp || '6281234567890';
  const salesPhotoUrl = settings.salesPhotoUrl || '';
  const salesBio =
    settings.salesBio ||
    'Siap melayani konsultasi pembelian mobil Toyota OTR Batam. Pelayanan profesional, transparan, cepat, dan terpercaya.';
  const dealershipName = settings.dealershipName || 'Agung Toyota Batam';
  const dealershipAddress =
    settings.dealershipAddress || 'Jl. Yos Sudarso, Batu Ampar, Kota Batam, Kepulauan Riau';

  const waUrl = buildWaUrl(
    salesWhatsapp,
    `Halo ${salesName}, saya ingin konsultasi rencana pembelian mobil Toyota OTR Batam.`
  );

  return (
    <main className="min-h-screen bg-gray-50 py-10 md:py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Page Title / Header */}
        <div className="text-center md:text-left mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100 mb-2">
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <span>Sales Representatif Resmi</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Profil Sales Executive
          </h1>
          <p className="text-gray-500 text-sm md:text-base mt-1">
            Hubungi konsultan resmi Agung Toyota Batam untuk solusi dan penawaran unit terbaik
          </p>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-10 p-6 md:p-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
            
            {/* Foto Profil: Rasio 3:4 Portrait Proporsional */}
            <div className="w-56 sm:w-64 shrink-0">
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-md">
                {salesPhotoUrl ? (
                  <img
                    src={salesPhotoUrl}
                    alt={salesName}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-4 text-center">
                    <Award className="w-16 h-16 text-gray-300 mb-2" />
                    <span className="text-xs font-medium">Foto Profil Sales</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info & Detail Sales */}
            <div className="flex-1 flex flex-col justify-between text-center md:text-left self-stretch">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 mb-3">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Aktif &amp; Siap Melayani
                </div>

                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                  {salesName}
                </h2>
                
                <p className="text-red-600 font-semibold text-base mt-1">
                  {salesTitle}
                </p>
                <p className="text-gray-500 text-sm">
                  {dealershipName}
                </p>

                {/* Slogan / Bio */}
                <div className="mt-5 p-4 md:p-5 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm md:text-base leading-relaxed italic">
                  &ldquo;{salesBio}&rdquo;
                </div>

                {/* Quick Info Tags */}
                <div className="mt-5 flex flex-wrap gap-4 justify-center md:justify-start text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-red-600" />
                    <span>Respon Cepat 08.00 - 21.00 WIB</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-red-600" />
                    <span>Cash, Kredit, &amp; Tukar Tambah</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-sm transition-all hover:shadow"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat WhatsApp Sales</span>
                </a>

                {salesPhone && (
                  <a
                    href={`tel:${salesPhone}`}
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm transition-colors"
                  >
                    <Phone className="w-4 h-4 text-gray-600" />
                    <span>Telepon Langsung</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Keunggulan Layanan Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1.5">Bantu Kredit Sampai Approved</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Didukung lembaga pembiayaan terkemuka dengan suku bunga bersaing dan proses berkas dibantu sampai serah terima unit.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1.5">Harga OTR Batam Terbaik</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Dapatkan diskon maksimal, promo cashback, bonus aksesoris resmi, serta transparansi rincian harga OTR Batam (FTZ).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1.5">Layanan Purna Jual Resmi</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Garansi resmi Toyota hingga 3-5 tahun, gratis servis dan oli berkala, serta kemudahan klaim asuransi di bengkel resmi.
            </p>
          </div>
        </div>

        {/* Dealer Information */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100 mb-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Showroom Resmi Agung Toyota Batam</h3>
              <p className="text-sm text-gray-500">Kunjungi showroom kami untuk melihat langsung display unit mobil impian Anda</p>
            </div>
            {settings.googleMapsUrl && (
              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 text-sm font-bold shrink-0"
              >
                <span>Buka Petunjuk Arah</span>
                <span>→</span>
              </a>
            )}
          </div>

          <div className="flex items-start gap-3.5 text-gray-700">
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">{dealershipName}</p>
              <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{dealershipAddress}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

