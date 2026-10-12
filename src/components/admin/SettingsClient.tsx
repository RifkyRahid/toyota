'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Check, Loader2, Image as ImageIcon, KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { SiteSetting } from '@/types';

interface SettingsClientProps {
  initialSettings: SiteSetting;
  initialAdminEmail?: string;
}

export default function SettingsClient({ initialSettings, initialAdminEmail = '' }: SettingsClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Security / Admin Account state
  const [adminEmail, setAdminEmail] = useState(initialAdminEmail);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingAccount, setUpdatingAccount] = useState(false);

  // Form states
  const [dealershipName, setDealershipName] = useState(initialSettings.dealershipName);
  const [dealershipAddress, setDealershipAddress] = useState(initialSettings.dealershipAddress);

  const [salesName, setSalesName] = useState(initialSettings.salesName);
  const [salesTitle, setSalesTitle] = useState(initialSettings.salesTitle);
  const [salesPhone, setSalesPhone] = useState(initialSettings.salesPhone);
  const [salesWhatsapp, setSalesWhatsapp] = useState(initialSettings.salesWhatsapp);
  const [salesBio, setSalesBio] = useState(initialSettings.salesBio || '');
  const [salesPhotoUrl, setSalesPhotoUrl] = useState(initialSettings.salesPhotoUrl || '');

  const [headerLogoUrl, setHeaderLogoUrl] = useState(initialSettings.headerLogoUrl);
  const [footerLogoUrl, setFooterLogoUrl] = useState(initialSettings.footerLogoUrl);
  const [pricelistPdfUrl, setPricelistPdfUrl] = useState(initialSettings.pricelistPdfUrl || '');

  const [instagramUrl, setInstagramUrl] = useState(initialSettings.instagramUrl || '');
  const [facebookUrl, setFacebookUrl] = useState(initialSettings.facebookUrl || '');
  const [tiktokUrl, setTiktokUrl] = useState(initialSettings.tiktokUrl || '');

  const [uploadingState, setUploadingState] = useState<string | null>(null);

  const handleFileUpload = async (
    field: 'salesPhoto' | 'headerLogo' | 'footerLogo' | 'pricelistPdf',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingState(field);
    const formData = new FormData();
    formData.append('file', file);
    const uploadContext = (field === 'headerLogo' || field === 'footerLogo') ? 'logo' : 'general';
    formData.append('context', uploadContext);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload gagal');
      }

      const { url } = await res.json();

      if (field === 'salesPhoto') setSalesPhotoUrl(url);
      if (field === 'headerLogo') setHeaderLogoUrl(url);
      if (field === 'footerLogo') setFooterLogoUrl(url);
      if (field === 'pricelistPdf') setPricelistPdfUrl(url);

      toast.success('Berkas berhasil diunggah! Klik "Simpan Perubahan" untuk menerapkan.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error upload berkas';
      toast.error(msg);
    } finally {
      setUploadingState(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      dealershipName,
      dealershipAddress,
      salesName,
      salesTitle,
      salesPhone,
      salesWhatsapp,
      salesBio: salesBio || null,
      salesPhotoUrl: salesPhotoUrl || null,
      headerLogoUrl,
      footerLogoUrl,
      pricelistPdfUrl: pricelistPdfUrl || null,
      instagramUrl: instagramUrl || null,
      facebookUrl: facebookUrl || null,
      tiktokUrl: tiktokUrl || null,
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Gagal memperbarui pengaturan.');

      toast.success('Pengaturan diler dan profil sales berhasil disimpan!');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Masukkan password saat ini untuk verifikasi keamanan.');
      return;
    }
    if (newPassword && newPassword.length < 8) {
      toast.error('Password baru minimal harus 8 karakter.');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('Konfirmasi password baru tidak cocok.');
      return;
    }
    if (!newPassword && adminEmail.toLowerCase().trim() === initialAdminEmail.toLowerCase().trim()) {
      toast.info('Tidak ada perubahan email atau password.');
      return;
    }

    setUpdatingAccount(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword: newPassword || undefined,
          newEmail: adminEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui akun.');
      }

      toast.success(data.message || 'Akun dan password berhasil diperbarui!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
      toast.error(msg);
    } finally {
      setUpdatingAccount(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Pengaturan Diler & Profil Sales
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data kontak sales representatif resmi, logo, berkas pricelist PDF OTR Batam, dan sosial media.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer self-start"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Check size={16} />
              <span>Simpan Perubahan</span>
            </>
          )}
        </button>
      </div>

      {/* 1. Profil Sales Representative */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-5">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
          1. Profil Sales Representative Resmi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Nama Lengkap Sales <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={salesName}
              onChange={(e) => setSalesName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Jabatan / Title Sales <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={salesTitle}
              onChange={(e) => setSalesTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Nomor WhatsApp Sales (Format 628...) <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={salesWhatsapp}
              onChange={(e) => setSalesWhatsapp(e.target.value)}
              placeholder="628123456789"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Nomor Telepon Panggilan Langsung <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={salesPhone}
              onChange={(e) => setSalesPhone(e.target.value)}
              placeholder="08123456789"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Bio / Slogan Pelayanan Sales
          </label>
          <textarea
            rows={2}
            value={salesBio}
            onChange={(e) => setSalesBio(e.target.value)}
            placeholder="Siap melayani pembelian cash dan kredit mobil Toyota di Batam..."
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        {/* Foto Sales 3:4 */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Foto Profil Sales (Rasio 3:4 Portrait)
          </label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-24 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              {salesPhotoUrl ? (
                <img src={salesPhotoUrl} alt="Sales" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="text-gray-400" size={20} />
              )}
            </div>

            <div className="flex-1">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors">
                <Upload size={14} />
                <span>
                  {uploadingState === 'salesPhoto' ? 'Mengunggah...' : 'Upload Foto Profil (3:4)'}
                </span>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload('salesPhoto', e)}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
              </label>
              <input
                type="text"
                value={salesPhotoUrl}
                onChange={(e) => setSalesPhotoUrl(e.target.value)}
                placeholder="/uploads/sales.webp"
                className="w-full mt-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Berkas & Logo */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-5">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
          2. Berkas Lembar Pricelist OTR Batam & Logo
        </h2>

        {/* Pricelist PDF URL */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            File Lembar Pricelist PDF (Lead Gate Download)
          </label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors shrink-0">
              <Upload size={14} />
              <span>
                {uploadingState === 'pricelistPdf' ? 'Mengunggah...' : 'Upload Berkas Pricelist'}
              </span>
              <input
                type="file"
                onChange={(e) => handleFileUpload('pricelistPdf', e)}
                accept="application/pdf,image/jpeg,image/png,image/webp"
                className="hidden"
              />
            </label>
            <input
              type="text"
              value={pricelistPdfUrl}
              onChange={(e) => setPricelistPdfUrl(e.target.value)}
              placeholder="https://... / pricelist-toyota-batam-2026.pdf"
              className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-mono"
            />
          </div>
        </div>

        {/* Logos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          {/* Header Logo */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Logo Header Navbar
            </label>
            <div className="flex items-center gap-3">
              <div className="w-28 h-14 bg-white border border-gray-200 rounded-md flex items-center justify-center p-1.5 shrink-0">
                {headerLogoUrl && <img src={headerLogoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />}
              </div>
              <label className="cursor-pointer px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-md">
                Pilih Logo
                <input
                  type="file"
                  onChange={(e) => handleFileUpload('headerLogo', e)}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
              </label>
            </div>
            <input
              type="text"
              value={headerLogoUrl}
              onChange={(e) => setHeaderLogoUrl(e.target.value)}
              className="w-full mt-2 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-mono"
            />
          </div>

          {/* Footer Logo */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Logo Footer (Versi Gelap / Monokrom)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-28 h-14 bg-zinc-900 border border-gray-800 rounded-md flex items-center justify-center p-1.5 shrink-0">
                {footerLogoUrl && (
                  <img src={footerLogoUrl} alt="Logo" className="max-h-full max-w-full object-contain brightness-0 invert" />
                )}
              </div>
              <label className="cursor-pointer px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-md">
                Pilih Logo
                <input
                  type="file"
                  onChange={(e) => handleFileUpload('footerLogo', e)}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
              </label>
            </div>
            <input
              type="text"
              value={footerLogoUrl}
              onChange={(e) => setFooterLogoUrl(e.target.value)}
              className="w-full mt-2 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3. Legalitas & Sosial Media */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-5">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
          3. Legalitas Diler & Media Sosial
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Nama Diler Resmi
            </label>
            <input
              type="text"
              value={dealershipName}
              onChange={(e) => setDealershipName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Alamat Showroom Batam
            </label>
            <input
              type="text"
              value={dealershipAddress}
              onChange={(e) => setDealershipAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Instagram URL
            </label>
            <input
              type="text"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Facebook URL
            </label>
            <input
              type="text"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="https://facebook.com/..."
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              TikTok URL
            </label>
            <input
              type="text"
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
              placeholder="https://tiktok.com/@..."
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Action */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-7 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Check size={16} />
              <span>Simpan Pengaturan Diler & Profil</span>
            </>
          )}
        </button>
      </div>
    </form>

    {/* 4. Keamanan Akun & Kredensial Administrator */}
    <form onSubmit={handleAccountUpdate} className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-5">
      <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KeyRound className="text-red-600" size={19} />
          <h2 className="text-base font-bold text-gray-900">
            4. Keamanan Akun & Kredensial Administrator
          </h2>
        </div>
        <span className="text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
          Autentikasi Panel Admin
        </span>
      </div>

      <p className="text-xs text-gray-500">
        Perbarui email login atau ganti password admin Anda secara mandiri di sini. Demi keamanan, password saat ini wajib diisi sebelum perubahan dapat disimpan.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Email Admin */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Email Administrator <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>

        {/* Password Saat Ini */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Password Saat Ini <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan password lama"
              className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>

        {/* Password Baru */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Password Baru (Minimal 8 Karakter)
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Kosongkan jika tidak ingin mengubah password"
              className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>

        {/* Konfirmasi Password Baru */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Konfirmasi Password Baru
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              disabled={!newPassword}
              className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={updatingAccount}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 hover:bg-black text-white font-semibold text-xs rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {updatingAccount ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Memperbarui Akun...</span>
            </>
          ) : (
            <>
              <ShieldCheck size={15} />
              <span>Update Akun & Password</span>
            </>
          )}
        </button>
      </div>
    </form>
  </div>
);
}
