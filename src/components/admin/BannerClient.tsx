'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Upload, Loader2, X, Check } from 'lucide-react';
import { toast } from 'sonner';

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  ctaText: string;
  ctaUrl: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
}

interface BannerClientProps {
  initialBanners: BannerItem[];
}

export default function BannerClient({ initialBanners }: BannerClientProps) {
  const router = useRouter();
  const [banners, setBanners] = useState<BannerItem[]>(initialBanners);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('Minta Penawaran');
  const [ctaUrl, setCtaUrl] = useState('#katalog');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', 'banner');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload banner gagal');
      const data = await res.json();
      setImageUrl(data.url);
      toast.success('Foto banner berhasil diunggah.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error upload';
      toast.error(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl || !ctaUrl) {
      toast.error('Judul, foto banner, dan URL tujuan wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle: subtitle || null,
          ctaText,
          ctaUrl,
          imageUrl,
          displayOrder: banners.length,
          isActive: true,
        }),
      });

      if (!res.ok) throw new Error('Gagal membuat banner');
      const newBanner = await res.json();
      setBanners((prev) => [...prev, newBanner]);
      toast.success('Banner baru berhasil ditambahkan.');
      setModalOpen(false);
      setTitle('');
      setSubtitle('');
      setImageUrl('');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, bannerTitle: string) => {
    if (!confirm(`Hapus banner "${bannerTitle}"?`)) return;

    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');

      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast.success('Banner berhasil dihapus.');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus banner.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Hero Slider Banner
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola slide gambar dan teks judul promo utama di bagian atas halaman beranda.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer self-start"
        >
          <Plus size={17} />
          <span>Tambah Banner Baru</span>
        </button>
      </div>

      {/* Grid of Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs flex flex-col justify-between"
          >
            <div className="relative h-48 bg-gray-900 overflow-hidden">
              <img
                src={b.imageUrl}
                alt={b.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end">
                <h3 className="text-white font-bold text-lg leading-snug drop-shadow">
                  {b.title}
                </h3>
                {b.subtitle && (
                  <p className="text-gray-200 text-xs mt-1 drop-shadow">{b.subtitle}</p>
                )}
                <span className="inline-block mt-2 px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold rounded w-fit">
                  CTA: {b.ctaText} ({b.ctaUrl})
                </span>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between border-t border-gray-100">
              <span className="text-xs text-gray-400 font-mono">
                Urutan: #{b.displayOrder}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(b.id, b.title)}
                className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
              >
                <Trash2 size={14} />
                <span>Hapus Banner</span>
              </button>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200">
            Belum ada banner promo khusus. Hero section akan menampilkan background default resmi.
          </div>
        )}
      </div>

      {/* Modal Tambah Banner */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Tambah Banner Hero Baru</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Judul Banner (HTML Overlay) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Promo Merdeka Batam DP Ringan"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Subjudul Singkat
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Dapatkan angsuran terjangkau khusus warga Batam"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Teks Tombol CTA
                  </label>
                  <input
                    type="text"
                    required
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    URL Tujuan (Anchor / WA)
                  </label>
                  <input
                    type="text"
                    required
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Upload Foto Banner */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Foto Latar Banner (Maks lebar 1920px) <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors">
                    <Upload size={14} />
                    <span>{uploadingImage ? 'Mengunggah...' : 'Upload Foto Banner'}</span>
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="/uploads/banner.webp"
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  <span>Simpan Banner</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
