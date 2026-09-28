'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import TagInput from '@/components/admin/TagInput';
import type { SerializedCarModel, SerializedCarVariant } from '@/types';

interface VariantFormState {
  id?: string;
  name: string;
  price: string;
  image: string;
  keyFeatures: string[];
  engineType: string;
  displacement: string;
  transmission: string;
  fuelType: string;
  maxPower: string;
  maxTorque: string;
  seatingCapacity: string;
}

interface CarFormProps {
  initialData?: (SerializedCarModel & { variants?: SerializedCarVariant[] }) | null;
  isEdit?: boolean;
}

const CATEGORIES = [
  'MPV',
  'SUV',
  'HATCHBACK',
  'SEDAN',
  'COMMERCIAL',
  'HYBRID_EV',
] as const;

export default function CarForm({ initialData, isEdit = false }: CarFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  // Model fields
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [category, setCategory] = useState(initialData?.category || 'MPV');
  const [heroImage, setHeroImage] = useState(initialData?.heroImage || '');
  const [startingPrice, setStartingPrice] = useState(initialData?.startingPrice || '');
  const [isPromo, setIsPromo] = useState(initialData?.isPromo ?? false);
  const [promoLabel, setPromoLabel] = useState(initialData?.promoLabel || '');
  const [brochurePdfUrl, setBrochurePdfUrl] = useState(initialData?.brochurePdfUrl || '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  // Variants list
  const [variants, setVariants] = useState<VariantFormState[]>(
    initialData?.variants && initialData.variants.length > 0
      ? initialData.variants.map((v) => ({
          id: v.id,
          name: v.name,
          price: String(v.price),
          image: v.image || '',
          keyFeatures: v.keyFeatures || [],
          engineType: v.engineType || '',
          displacement: v.displacement ? String(v.displacement) : '',
          transmission: v.transmission || '',
          fuelType: v.fuelType || '',
          maxPower: v.maxPower || '',
          maxTorque: v.maxTorque || '',
          seatingCapacity: v.seatingCapacity ? String(v.seatingCapacity) : '',
        }))
      : [
          {
            name: '',
            price: '',
            image: '',
            keyFeatures: [],
            engineType: '',
            displacement: '',
            transmission: '',
            fuelType: '',
            maxPower: '',
            maxTorque: '',
            seatingCapacity: '7',
          },
        ]
  );

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', 'cars');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload hero image gagal');
      }

      const { url } = await res.json();
      setHeroImage(url);
      toast.success('Foto utama berhasil diunggah.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal upload hero image';
      toast.error(message);
    } finally {
      setUploadingHero(false);
    }
  };

  const handleVariantImageUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', 'cars');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload foto varian gagal');
      }

      const { url } = await res.json();
      updateVariant(index, { image: url });
      toast.success(`Foto varian #${index + 1} berhasil diunggah.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal upload foto varian';
      toast.error(message);
    }
  };

  const updateVariant = (index: number, fields: Partial<VariantFormState>) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...fields };
      return updated;
    });
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        name: '',
        price: '',
        image: '',
        keyFeatures: [],
        engineType: '',
        displacement: '',
        transmission: '',
        fuelType: '',
        maxPower: '',
        maxTorque: '',
        seatingCapacity: '7',
      },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) {
      toast.error('Minimal harus ada 1 varian untuk unit mobil.');
      return;
    }
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !slug || !heroImage) {
      toast.error('Nama mobil, slug, dan foto utama wajib diisi.');
      return;
    }

    if (variants.some((v) => !v.name || !v.price)) {
      toast.error('Semua varian wajib memiliki nama tipe dan harga OTR.');
      return;
    }

    setSubmitting(true);

    const payload = {
      name,
      slug,
      category,
      heroImage,
      startingPrice: startingPrice ? Number(startingPrice) : undefined,
      isPromo,
      promoLabel: isPromo ? promoLabel : null,
      brochurePdfUrl: brochurePdfUrl || null,
      isActive,
      variants: variants.map((v) => ({
        name: v.name,
        price: Number(v.price),
        image: v.image || null,
        keyFeatures: v.keyFeatures,
        engineType: v.engineType || null,
        displacement: v.displacement ? parseInt(v.displacement, 10) : null,
        transmission: v.transmission || null,
        fuelType: v.fuelType || null,
        maxPower: v.maxPower || null,
        maxTorque: v.maxTorque || null,
        seatingCapacity: v.seatingCapacity ? parseInt(v.seatingCapacity, 10) : null,
      })),
    };

    try {
      const url = isEdit ? `/api/cars/${initialData?.id}` : '/api/cars';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menyimpan unit');
      }

      toast.success(isEdit ? 'Data mobil berhasil diperbarui.' : 'Unit mobil baru berhasil ditambahkan.');
      router.push('/admin/katalog');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan server.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/katalog"
            className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isEdit ? `Edit Model: ${initialData?.name}` : 'Tambah Unit Mobil Baru'}
          </h1>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Check size={16} />
              <span>Simpan Model Mobil</span>
            </>
          )}
        </button>
      </div>

      {/* Section 1: Informasi Model Dasar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-5">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
          1. Informasi Model Kendaraan
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nama Model */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Nama Model Mobil <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Contoh: All New Avanza"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Slug URL */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              URL Slug <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="all-new-avanza"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Kategori Kendaraan <span className="text-red-600">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Starting Price (Opsional) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Harga Dasar OTR Batam (Rp)
            </label>
            <input
              type="number"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              placeholder="Kosongkan untuk otomatis dari varian termurah"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Hero Image Upload */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Foto Utama Mobil (PNG Transparan / WebP) <span className="text-red-600">*</span>
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-32 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt="Preview"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <span className="text-xs text-gray-400">Belum ada foto</span>
              )}
            </div>

            <div className="flex-1 w-full">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors">
                <Upload size={14} />
                <span>{uploadingHero ? 'Mengunggah...' : 'Pilih & Upload Foto Utama'}</span>
                <input
                  type="file"
                  onChange={handleHeroUpload}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploadingHero}
                />
              </label>
              <input
                type="text"
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                placeholder="/uploads/nama-file.webp"
                className="w-full mt-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-mono text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Promo Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPromo"
              checked={isPromo}
              onChange={(e) => setIsPromo(e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="isPromo" className="text-sm font-semibold text-gray-800 cursor-pointer">
              Tandai sebagai Unit Promo (Tampil di Beranda)
            </label>
          </div>

          {isPromo && (
            <div>
              <input
                type="text"
                value={promoLabel}
                onChange={(e) => setPromoLabel(e.target.value)}
                placeholder="Label Promo (misal: PROMO DP RINGAN)"
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
              />
            </div>
          )}
        </div>

        {/* Brochure URL & Active status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-gray-100">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Tautan Brosur PDF (Opsional)
            </label>
            <input
              type="text"
              value={brochurePdfUrl}
              onChange={(e) => setBrochurePdfUrl(e.target.value)}
              placeholder="https://... / brosur-avanza.pdf"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="isActive" className="text-sm font-semibold text-gray-800 cursor-pointer">
              Tayangkan di Website Publik (Aktif)
            </label>
          </div>
        </div>
      </div>

      {/* Section 2: Varian & Tipe Mobil */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              2. Daftar Tipe / Varian & Spesifikasi
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Setiap model mobil minimal memiliki 1 varian dengan harga OTR Batam dan fitur unggulan.
            </p>
          </div>

          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <Plus size={15} />
            <span>Tambah Varian</span>
          </button>
        </div>

        <div className="space-y-6">
          {variants.map((v, idx) => (
            <div
              key={idx}
              className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 space-y-4 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                  Varian #{idx + 1}
                </span>

                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Hapus Varian ini"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Basic variant info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Tipe / Varian <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={v.name}
                    onChange={(e) => updateVariant(idx, { name: e.target.value })}
                    placeholder="Contoh: 1.5 G CVT"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Harga OTR Batam (Rp) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={v.price}
                    onChange={(e) => updateVariant(idx, { price: e.target.value })}
                    placeholder="Contoh: 265000000"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* Key features (Pills / Tag input) */}
              <div>
                <TagInput
                  label="Fitur Unggulan Varian (Tekan Enter untuk menambah)"
                  value={v.keyFeatures}
                  onChange={(tags) => updateVariant(idx, { keyFeatures: tags })}
                  placeholder="Ketik fitur (misal: 7 Airbags, LED Headlamp, TSS) lalu tekan Enter"
                />
              </div>

              {/* Technical Specifications */}
              <div className="pt-3 border-t border-gray-200/80">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-3">
                  Spesifikasi Teknis (Accordion Detail)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">Tipe Mesin</label>
                    <input
                      type="text"
                      value={v.engineType}
                      onChange={(e) => updateVariant(idx, { engineType: e.target.value })}
                      placeholder="2NR-VE 4-Silinder"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">Kapasitas Mesin (cc)</label>
                    <input
                      type="number"
                      value={v.displacement}
                      onChange={(e) => updateVariant(idx, { displacement: e.target.value })}
                      placeholder="1496"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">Transmisi</label>
                    <input
                      type="text"
                      value={v.transmission}
                      onChange={(e) => updateVariant(idx, { transmission: e.target.value })}
                      placeholder="CVT / Manual 5-Speed"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">Bahan Bakar</label>
                    <input
                      type="text"
                      value={v.fuelType}
                      onChange={(e) => updateVariant(idx, { fuelType: e.target.value })}
                      placeholder="Bensin Tanpa Timbal"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">Tenaga Maksimal</label>
                    <input
                      type="text"
                      value={v.maxPower}
                      onChange={(e) => updateVariant(idx, { maxPower: e.target.value })}
                      placeholder="106 PS / 6000 rpm"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">Kapasitas Penumpang</label>
                    <input
                      type="number"
                      value={v.seatingCapacity}
                      onChange={(e) => updateVariant(idx, { seatingCapacity: e.target.value })}
                      placeholder="7"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Variant specific photo upload */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Foto Spesifik Varian (Opsional - default memakai foto utama)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-md">
                    <Upload size={13} />
                    <span>Upload Foto Varian</span>
                    <input
                      type="file"
                      onChange={(e) => handleVariantImageUpload(idx, e)}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={v.image}
                    onChange={(e) => updateVariant(idx, { image: e.target.value })}
                    placeholder="/uploads/varian.webp"
                    className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-mono text-gray-600"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
