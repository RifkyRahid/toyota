import Link from 'next/link';
import { Home, Car, FileText, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center relative overflow-hidden px-4 py-16 select-none">
      {/* Latar Belakang Efek Cahaya & Grid Otomotif */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.8) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Aksen Garis Sporty GR di Atas */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-zinc-900 via-red-600 to-zinc-900" />

      <div className="relative z-10 max-w-xl w-full text-center">
        {/* Badge Kecil */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-red-400 text-xs font-extrabold uppercase tracking-widest mb-6">
          <Compass size={14} className="animate-spin" style={{ animationDuration: '8s' }} />
          <span>Salah Jalur Navigasi • Error 404</span>
        </div>

        {/* Angka 404 Sporty */}
        <div className="relative flex items-center justify-center my-2">
          <h1 className="text-[110px] sm:text-[145px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 drop-shadow-[0_10px_30px_rgba(220,38,38,0.25)]">
            404
          </h1>
          <span className="absolute -bottom-2 px-4 py-1 rounded-md bg-red-600 text-white text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.2em] shadow-lg shadow-red-600/30">
            Halaman Tidak Ditemukan
          </span>
        </div>

        {/* Judul & Pesan */}
        <h2 className="text-xl sm:text-2xl font-bold text-white mt-8">
          Ups! Sepertinya Anda Keluar dari Jalur Utama
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 mt-2.5 max-w-md mx-auto leading-relaxed">
          Halaman yang Anda tuju tidak tersedia, telah dipindahkan, atau alamat URL yang dimasukkan kurang tepat.
        </p>

        {/* Tombol Navigasi Cepat */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-lg shadow-red-600/25"
          >
            <Home size={17} />
            <span>Kembali ke Beranda</span>
          </Link>

          <Link
            href="/katalog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold text-sm transition-all"
          >
            <Car size={17} />
            <span>Lihat Katalog Unit</span>
          </Link>

          <Link
            href="/daftar-harga"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 font-semibold text-sm transition-all"
          >
            <FileText size={16} />
            <span>Pricelist OTR</span>
          </Link>
        </div>

        {/* Footer Kecil */}
        <div className="mt-12 pt-6 border-t border-white/10 text-xs text-zinc-500">
          Agung Toyota Batam • Authorized Toyota Dealership Kepulauan Riau
        </div>
      </div>
    </div>
  );
}
