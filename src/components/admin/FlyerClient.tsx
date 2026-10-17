'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Upload,
  Loader2,
  X,
  Check,
  Pencil,
  Sparkles,
  Image as ImageIcon,
  Eye,
  MessageCircle,
  Trophy,
  RotateCcw,
  Wand2,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import type { PromoFlyerItem } from '@/types';
import { FlyerPosterCanvas } from '@/components/public/PromoFlyerSection';
import { formatRupiah } from '@/lib/format';

export interface CatalogCarOption {
  id: string;
  name: string;
  slug: string;
  heroImage: string;
  startingPrice: string;
  promoLabel: string | null;
  isPromo: boolean;
}

interface FlyerClientProps {
  initialFlyers: PromoFlyerItem[];
  catalogCars: CatalogCarOption[];
}

const PRESET_BENEFITS = [
  'Bunga 0%',
  'Cash Bertahap 50:50',
  'Gratis Aksesoris',
  'Trade-In All Brand',
  'Free Jasa Servis',
  'Proses Cepat & Mudah',
];

export default function FlyerClient({ initialFlyers, catalogCars }: FlyerClientProps) {
  const router = useRouter();
  const [flyers, setFlyers] = useState<PromoFlyerItem[]>(initialFlyers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFlyer, setEditingFlyer] = useState<PromoFlyerItem | null>(null);
  const [importingPromo, setImportingPromo] = useState(false);

  // Form States
  const [mode, setMode] = useState<'AUTO' | 'IMAGE'>('AUTO');
  const [theme, setTheme] = useState<'RED_WHITE' | 'DARK_LUXURY' | 'SILVER_SPORT'>('RED_WHITE');
  const [title, setTitle] = useState('');
  const [eventTag, setEventTag] = useState('TOYOTA SPEKTAKULER');
  const [subtitle, setSubtitle] = useState('');
  const [carSlug, setCarSlug] = useState('');
  const [carImageUrl, setCarImageUrl] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [highlight1Label, setHighlight1Label] = useState('Cicilan Mulai');
  const [highlight1Value, setHighlight1Value] = useState('3 Jtan');
  const [highlight2Label, setHighlight2Label] = useState('DP Mulai');
  const [highlight2Value, setHighlight2Value] = useState('15%');
  const [benefits, setBenefits] = useState<string[]>([
    'Bunga 0%',
    'Cash Bertahap 50:50',
    'Gratis Aksesoris',
    'Trade-In All Brand',
  ]);
  const [benefitInput, setBenefitInput] = useState('');
  const [waCustomMessage, setWaCustomMessage] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);

  const [uploadingCarImage, setUploadingCarImage] = useState(false);
  const [uploadingCustomImage, setUploadingCustomImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Ringkasan Analitik Flyer ──
  const stats = useMemo(() => {
    const activeCount = flyers.filter((f) => f.isActive).length;
    const totalViews = flyers.reduce((acc, f) => acc + (f.viewCount || 0), 0);
    const totalWaClicks = flyers.reduce((acc, f) => acc + (f.waClickCount || 0), 0);
    const topFlyer = [...flyers].sort(
      (a, b) =>
        b.waClickCount * 2 + b.viewCount - (a.waClickCount * 2 + a.viewCount)
    )[0];

    return {
      activeCount,
      totalViews,
      totalWaClicks,
      topFlyer:
        topFlyer && (topFlyer.waClickCount > 0 || topFlyer.viewCount > 0)
          ? topFlyer
          : null,
    };
  }, [flyers]);

  const openCreateModal = () => {
    setEditingFlyer(null);
    setMode('AUTO');
    setTheme('RED_WHITE');
    setTitle('');
    setEventTag('TOYOTA SPEKTAKULER');
    setSubtitle('OTR Batam • Syarat & Ketentuan Berlaku');
    setCarSlug('');
    setCarImageUrl('');
    setCustomImageUrl('');
    setHighlight1Label('Cicilan Mulai');
    setHighlight1Value('3 Jtan');
    setHighlight2Label('DP Mulai');
    setHighlight2Value('15%');
    setBenefits([
      'Bunga 0%',
      'Cash Bertahap 50:50',
      'Gratis Aksesoris',
      'Trade-In All Brand',
    ]);
    setBenefitInput('');
    setWaCustomMessage('');
    setDisplayOrder(flyers.length);
    setModalOpen(true);
  };

  const openEditModal = (flyer: PromoFlyerItem) => {
    setEditingFlyer(flyer);
    setMode(flyer.mode === 'IMAGE' ? 'IMAGE' : 'AUTO');
    setTheme(flyer.theme || 'RED_WHITE');
    setTitle(flyer.title);
    setEventTag(flyer.eventTag || 'TOYOTA SPEKTAKULER');
    setSubtitle(flyer.subtitle || '');
    setCarSlug(flyer.carSlug || '');
    setCarImageUrl(flyer.carImageUrl || '');
    setCustomImageUrl(flyer.customImageUrl || '');
    setHighlight1Label(flyer.highlight1Label || 'Cicilan Mulai');
    setHighlight1Value(flyer.highlight1Value || '3 Jtan');
    setHighlight2Label(flyer.highlight2Label || 'DP Mulai');
    setHighlight2Value(flyer.highlight2Value || '15%');
    setBenefits(
      flyer.benefits && flyer.benefits.length > 0
        ? flyer.benefits
        : ['Bunga 0%', 'Cash Bertahap 50:50', 'Gratis Aksesoris', 'Trade-In All Brand']
    );
    setBenefitInput('');
    setWaCustomMessage(flyer.waCustomMessage || '');
    setDisplayOrder(flyer.displayOrder || 0);
    setModalOpen(true);
  };

  // Auto-fill saat memilih mobil dari Katalog
  const handleSelectCatalogCar = (slug: string) => {
    setCarSlug(slug);
    const found = catalogCars.find((c) => c.slug === slug);
    if (found) {
      setTitle(found.name);
      setCarImageUrl(found.heroImage);
      setSubtitle(`OTR Batam Mulai ${formatRupiah(found.startingPrice)}`);
      if (found.promoLabel) {
        setHighlight1Value(found.promoLabel);
      }
      toast.info(`Data & foto unit ${found.name} berhasil diterapkan ke flyer.`);
    }
  };

  const handleUploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'CAR' | 'POSTER'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === 'CAR') setUploadingCarImage(true);
    else setUploadingCustomImage(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', target === 'POSTER' ? 'banner' : 'car');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Gagal mengunggah gambar');
      const data = await res.json();

      if (target === 'CAR') {
        setCarImageUrl(data.url);
        toast.success('Foto mobil berhasil diunggah.');
      } else {
        setCustomImageUrl(data.url);
        toast.success('Poster flyer berhasil diunggah.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error upload';
      toast.error(msg);
    } finally {
      if (target === 'CAR') setUploadingCarImage(false);
      else setUploadingCustomImage(false);
    }
  };

  const addBenefit = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    if (benefits.includes(clean)) {
      toast.error('Poin benefit tersebut sudah ada.');
      return;
    }
    if (benefits.length >= 6) {
      toast.error('Maksimal 6 poin benefit agar tampilan flyer tetap rapi.');
      return;
    }
    setBenefits((prev) => [...prev, clean]);
    setBenefitInput('');
  };

  const removeBenefit = (idx: number) => {
    setBenefits((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Judul / Nama Unit wajib diisi.');
      return;
    }
    if (mode === 'AUTO' && !carImageUrl) {
      toast.error('Silakan pilih unit dari katalog atau unggah foto mobil untuk Auto-Flyer.');
      return;
    }
    if (mode === 'IMAGE' && !customImageUrl) {
      toast.error('Silakan unggah gambar poster untuk mode Upload Gambar Flyer.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        mode,
        theme,
        title: title.trim(),
        eventTag: eventTag.trim() || 'TOYOTA SPEKTAKULER',
        subtitle: subtitle.trim() || null,
        carSlug: carSlug || null,
        carImageUrl: carImageUrl || null,
        customImageUrl: customImageUrl || null,
        highlight1Label: highlight1Label.trim() || 'Cicilan Mulai',
        highlight1Value: highlight1Value.trim() || '3 Jtan',
        highlight2Label: highlight2Label.trim() || 'DP Mulai',
        highlight2Value: highlight2Value.trim() || '15%',
        benefits,
        waCustomMessage: waCustomMessage.trim() || null,
        displayOrder: Number(displayOrder) || 0,
      };

      if (editingFlyer) {
        const res = await fetch(`/api/flyers/${editingFlyer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Gagal memperbarui flyer');
        const updated = await res.json();
        setFlyers((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
        toast.success('Flyer promo berhasil diperbarui.');
      } else {
        const res = await fetch('/api/flyers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, isActive: true }),
        });
        if (!res.ok) throw new Error('Gagal membuat flyer');
        const created = await res.json();
        setFlyers((prev) => [...prev, created]);
        toast.success('Flyer promo baru berhasil ditambahkan.');
      }

      setModalOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (flyer: PromoFlyerItem) => {
    try {
      const res = await fetch(`/api/flyers/${flyer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !flyer.isActive }),
      });
      if (!res.ok) throw new Error('Gagal mengubah status flyer');
      const updated = await res.json();
      setFlyers((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      toast.success(
        `Flyer "${flyer.title}" ${updated.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`
      );
      router.refresh();
    } catch {
      toast.error('Gagal mengubah status flyer.');
    }
  };

  const handleResetFlyerStats = async (flyer: PromoFlyerItem) => {
    if (!confirm(`Reset hitungan dilihat & klaim WA untuk flyer "${flyer.title}" menjadi 0?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/flyers/${flyer.id}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET' }),
      });
      if (!res.ok) throw new Error('Gagal mereset statistik');
      setFlyers((prev) =>
        prev.map((f) =>
          f.id === flyer.id ? { ...f, viewCount: 0, waClickCount: 0 } : f
        )
      );
      toast.success(`Statistik klik flyer "${flyer.title}" direset ke 0.`);
      router.refresh();
    } catch {
      toast.error('Gagal mereset statistik flyer.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus flyer promo "${name}"?`)) return;
    try {
      const res = await fetch(`/api/flyers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus flyer');
      setFlyers((prev) => prev.filter((f) => f.id !== id));
      toast.success('Flyer promo berhasil dihapus.');
      router.refresh();
    } catch {
      toast.error('Gagal menghapus flyer.');
    }
  };

  // Fitur 1-Klik Generate Auto-Flyer dari Unit Promo di Katalog
  const handleQuickImportFromPromoCars = async () => {
    const promoCars = catalogCars.filter((c) => c.isPromo);
    const sourceCars = promoCars.length > 0 ? promoCars : catalogCars.slice(0, 3);

    if (sourceCars.length === 0) {
      toast.error('Belum ada unit mobil di katalog untuk diimpor.');
      return;
    }

    setImportingPromo(true);
    try {
      const themes: Array<'RED_WHITE' | 'DARK_LUXURY' | 'SILVER_SPORT'> = [
        'RED_WHITE',
        'DARK_LUXURY',
        'SILVER_SPORT',
      ];
      const createdList: PromoFlyerItem[] = [];

      for (let i = 0; i < Math.min(sourceCars.length, 6); i++) {
        const car = sourceCars[i];
        const res = await fetch('/api/flyers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'AUTO',
            theme: themes[i % themes.length],
            title: car.name,
            eventTag: 'TOYOTA SPEKTAKULER',
            subtitle: `OTR Batam Mulai ${formatRupiah(car.startingPrice)}`,
            carSlug: car.slug,
            carImageUrl: car.heroImage,
            highlight1Label: 'Cicilan Mulai',
            highlight1Value: car.promoLabel || '3 Jtan',
            highlight2Label: 'DP Mulai',
            highlight2Value: '15%',
            benefits: [
              'Bunga 0%',
              'Cash Bertahap 50:50',
              'Gratis Aksesoris',
              'Trade-In All Brand',
            ],
            displayOrder: flyers.length + i,
            isActive: true,
          }),
        });
        if (res.ok) {
          const item = await res.json();
          createdList.push(item);
        }
      }

      setFlyers((prev) => [...prev, ...createdList]);
      toast.success(`${createdList.length} Auto-Flyer berhasil dibuat dari katalog unit!`);
      router.refresh();
    } catch {
      toast.error('Gagal membuat flyer otomatis.');
    } finally {
      setImportingPromo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header Halaman ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Flyer Promo & Paket Kredit
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola poster promo di halaman utama (Opsi Auto-Flyer Otomatis maupun Upload Poster Canva) beserta analitik kliknya.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {catalogCars.length > 0 && (
            <button
              type="button"
              disabled={importingPromo}
              onClick={handleQuickImportFromPromoCars}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              title="Buat Auto-Flyer otomatis dari unit mobil bertanda Promo di Katalog"
            >
              {importingPromo ? (
                <Loader2 size={16} className="animate-spin text-red-600" />
              ) : (
                <Wand2 size={16} className="text-red-600" />
              )}
              <span>Generate dari Katalog Promo</span>
            </button>
          )}

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Tambah Flyer Promo</span>
          </button>
        </div>
      </div>

      {/* ── 4 Kartu Ringkasan Analitik Klik Flyer ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
            Flyer Aktif Tayang
          </span>
          <p className="text-2xl font-black text-gray-900 mt-1">
            {stats.activeCount}{' '}
            <span className="text-xs font-medium text-gray-400">
              / {flyers.length} total
            </span>
          </p>
          <span className="text-[11px] text-gray-500 mt-1 block">
            Tampil di beranda website
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
              Total Diperbesar (Lightbox)
            </span>
            <Eye size={15} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalViews}x</p>
          <span className="text-[11px] text-gray-500 mt-1 block">
            Pengunjung mengklik gambar poster
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-green-600 block">
              Total Klaim Promo via WA
            </span>
            <MessageCircle size={15} className="text-green-600" />
          </div>
          <p className="text-2xl font-black text-green-700 mt-1">
            {stats.totalWaClicks}x
          </p>
          <span className="text-[11px] text-gray-500 mt-1 block">
            Klik tombol WA dari kartu flyer
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
              Flyer Paling Diminati
            </span>
            <Trophy size={15} className="text-amber-500" />
          </div>
          {stats.topFlyer ? (
            <>
              <p className="text-sm font-black text-gray-900 mt-1.5 truncate">
                {stats.topFlyer.title}
              </p>
              <span className="text-[11px] text-red-600 font-semibold mt-1 block">
                {stats.topFlyer.waClickCount} Klaim WA • {stats.topFlyer.viewCount} Dilihat
              </span>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-gray-400 mt-1.5">Belum ada klik</p>
              <span className="text-[11px] text-gray-400 mt-1 block">
                Menunggu interaksi pengunjung
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Grid Daftar Flyer ── */}
      {flyers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
            <Sparkles size={24} />
          </div>
          <h3 className="text-base font-bold text-gray-900">
            Belum Ada Flyer Promo Tersimpan
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
            Saat ini halaman depan menampilkan fallback otomatis dari unit bertanda Promo. Klik{' '}
            <strong>&ldquo;Generate dari Katalog Promo&rdquo;</strong> atau{' '}
            <strong>&ldquo;Tambah Flyer Promo&rdquo;</strong> untuk mulai mengelola flyer dan merekam analitik klik.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flyers.map((flyer) => (
            <div
              key={flyer.id}
              className={`bg-white rounded-2xl border overflow-hidden shadow-xs flex flex-col transition-all ${
                flyer.isActive ? 'border-gray-200' : 'border-gray-200 opacity-60'
              }`}
            >
              {/* Preview Poster */}
              <div className="relative group">
                <FlyerPosterCanvas flyer={flyer} />

                {/* Badge Status & Mode di Sudut Atas */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20 pointer-events-none">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                      flyer.mode === 'IMAGE'
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-900/90 text-white backdrop-blur-xs'
                    }`}
                  >
                    {flyer.mode === 'IMAGE' ? (
                      <>
                        <ImageIcon size={11} />
                        <span>Opsi 1: Gambar Poster</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={11} />
                        <span>Opsi 2: Auto-Flyer</span>
                      </>
                    )}
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm ${
                      flyer.isActive
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-white'
                    }`}
                  >
                    {flyer.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>

              {/* Statistik Klik Flyer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md"
                    title="Berapa kali gambar diperbesar (Lightbox Preview)"
                  >
                    <Eye size={13} />
                    <span>{flyer.viewCount || 0} Dilihat</span>
                  </span>
                  <span
                    className="inline-flex items-center gap-1 font-semibold text-green-700 bg-green-50 border border-green-200/80 px-2 py-0.5 rounded-md"
                    title="Berapa kali tombol Klaim Promo via WA diklik"
                  >
                    <MessageCircle size={13} />
                    <span>{flyer.waClickCount || 0} Klaim WA</span>
                  </span>
                </div>

                {(flyer.viewCount > 0 || flyer.waClickCount > 0) && (
                  <button
                    type="button"
                    onClick={() => handleResetFlyerStats(flyer)}
                    title="Reset hitungan klik flyer ini ke 0"
                    className="p-1 text-gray-400 hover:text-amber-600 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
              </div>

              {/* Tombol Aksi Admin */}
              <div className="p-3.5 bg-white border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleActive(flyer)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    flyer.isActive
                      ? 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      : 'border-green-600 text-green-600 hover:bg-green-50'
                  }`}
                >
                  <Check size={13} />
                  <span>{flyer.isActive ? 'Nonaktifkan' : 'Aktifkan'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(flyer)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Pencil size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(flyer.id, flyer.title)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Flyer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL TAMBAH / EDIT FLYER DENGAN LIVE PREVIEW ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-gray-100 relative my-8 max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-gray-900">
              {editingFlyer ? `Edit Flyer Promo: ${editingFlyer.title}` : 'Tambah Flyer Promo Baru'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 mb-5">
              Pilih antara <strong>Opsi 2 (Auto-Flyer Otomatis)</strong> agar desain 100% rapi dan senada website, atau <strong>Opsi 1 (Upload Poster Sendiri)</strong> jika sudah memiliki desain dari Canva/Photoshop.
            </p>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* ── KOLOM KIRI: FORM PENGATURAN (7 Kolom) ── */}
              <div className="lg:col-span-7 space-y-4">
                {/* Pilihan Mode (Opsi 2 Auto vs Opsi 1 Upload Gambar) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Sistem Pembuatan Flyer
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setMode('AUTO')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        mode === 'AUTO'
                          ? 'border-red-600 bg-red-50/60 ring-1 ring-red-600'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Sparkles
                        size={18}
                        className={`mt-0.5 shrink-0 ${
                          mode === 'AUTO' ? 'text-red-600' : 'text-gray-400'
                        }`}
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">
                          Opsi 2: Auto-Flyer (Rekomendasi)
                        </span>
                        <span className="text-[11px] text-gray-500 leading-snug block mt-0.5">
                          Cukup isi angka cicilan &amp; DP, desain poster otomatis dibuat rapi senada web.
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode('IMAGE')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        mode === 'IMAGE'
                          ? 'border-red-600 bg-red-50/60 ring-1 ring-red-600'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <ImageIcon
                        size={18}
                        className={`mt-0.5 shrink-0 ${
                          mode === 'IMAGE' ? 'text-red-600' : 'text-gray-400'
                        }`}
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">
                          Opsi 1: Upload Gambar Poster
                        </span>
                        <span className="text-[11px] text-gray-500 leading-snug block mt-0.5">
                          Unggah file gambar poster jadi (JPG/PNG/WebP rasio 4:5) hasil desain sendiri.
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Ambil Cepat dari Katalog Unit */}
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Hubungkan dengan Unit di Katalog (Opsional — Isi Otomatis)
                  </label>
                  <select
                    value={carSlug}
                    onChange={(e) => handleSelectCatalogCar(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="">-- Pilih Mobil dari Katalog (atau ketik manual di bawah) --</option>
                    {catalogCars.map((car) => (
                      <option key={car.id} value={car.slug}>
                        {car.name} ({formatRupiah(car.startingPrice)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tema Warna (Khusus Mode AUTO) */}
                {mode === 'AUTO' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Tema Warna Poster Auto-Flyer
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'RED_WHITE', label: 'Clean White & Red' },
                        { id: 'DARK_LUXURY', label: 'Dark GR Carbon' },
                        { id: 'SILVER_SPORT', label: 'Silver Metallic' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() =>
                            setTheme(t.id as 'RED_WHITE' | 'DARK_LUXURY' | 'SILVER_SPORT')
                          }
                          className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            theme === t.id
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Judul Unit & Tagline Event */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nama Unit / Judul Promo *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="Contoh: All New Avanza"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Label Program (Header Atas)
                    </label>
                    <input
                      type="text"
                      value={eventTag}
                      onChange={(e) => setEventTag(e.target.value)}
                      placeholder="Contoh: TOYOTA SPEKTAKULER"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                </div>

                {/* Subjudul */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Subjudul / Keterangan OTR
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Contoh: OTR Batam Mulai Rp 245.000.000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                {/* 2 Highlight Angka Utama (Cicilan & DP) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-red-50/40 rounded-xl border border-red-100">
                  <div className="space-y-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-600 block">
                      Highlight Utama 1 (Kotak Merah)
                    </span>
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-0.5">Label 1</label>
                      <input
                        type="text"
                        value={highlight1Label}
                        onChange={(e) => setHighlight1Label(e.target.value)}
                        placeholder="Cicilan Mulai"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-0.5">
                        Angka / Nilai 1
                      </label>
                      <input
                        type="text"
                        value={highlight1Value}
                        onChange={(e) => setHighlight1Value(e.target.value)}
                        placeholder="3 Jtan"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-red-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-700 block">
                      Highlight Utama 2 (Kotak Hitam)
                    </span>
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-0.5">Label 2</label>
                      <input
                        type="text"
                        value={highlight2Label}
                        onChange={(e) => setHighlight2Label(e.target.value)}
                        placeholder="DP Mulai"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-0.5">
                        Angka / Nilai 2
                      </label>
                      <input
                        type="text"
                        value={highlight2Value}
                        onChange={(e) => setHighlight2Value(e.target.value)}
                        placeholder="15%"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Pengaturan Spesifik Mode AUTO vs Mode IMAGE */}
                {mode === 'AUTO' ? (
                  <>
                    {/* Upload / Pilih Foto Mobil Transparan */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Foto Mobil (PNG Transparan) *
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-3.5 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-500 hover:bg-red-50/20 transition-colors text-xs font-semibold text-gray-600">
                          {uploadingCarImage ? (
                            <Loader2 size={15} className="animate-spin text-red-600" />
                          ) : (
                            <Upload size={15} />
                          )}
                          <span>
                            {carImageUrl ? 'Ganti Foto Mobil' : 'Unggah Foto Mobil Sendiri'}
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => handleUploadImage(e, 'CAR')}
                            className="hidden"
                          />
                        </label>
                        {carImageUrl && (
                          <span className="text-[11px] text-green-600 font-semibold">
                            ✓ Foto mobil siap ditampilkan
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Poin Benefit (Pills) */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Poin Keuntungan / Benefit (Maksimal 4–6 Poin)
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={benefitInput}
                          onChange={(e) => setBenefitInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addBenefit(benefitInput);
                            }
                          }}
                          placeholder="Ketik benefit lalu tekan Tambah..."
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => addBenefit(benefitInput)}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          + Tambah
                        </button>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {PRESET_BENEFITS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => addBenefit(preset)}
                            className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer"
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>

                      {/* Active Benefits */}
                      <div className="flex flex-wrap gap-1.5">
                        {benefits.map((b, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200"
                          >
                            <span>{b}</span>
                            <button
                              type="button"
                              onClick={() => removeBenefit(idx)}
                              className="hover:text-red-900 cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Mode IMAGE: Upload Poster Sendiri + Panduan Desain */
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Unggah File Gambar Poster Flyer (Rasio 4:5 Portrait — 1080x1350 px) *
                      </label>
                      <label className="flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-500 hover:bg-red-50/20 transition-colors">
                        {uploadingCustomImage ? (
                          <Loader2 size={18} className="animate-spin text-red-600" />
                        ) : (
                          <Upload size={18} className="text-red-600" />
                        )}
                        <span className="text-xs font-semibold text-gray-700">
                          {uploadingCustomImage
                            ? 'Mengunggah poster...'
                            : customImageUrl
                            ? 'Ganti Gambar Poster Flyer'
                            : 'Pilih File Poster (JPG / PNG / WebP)'}
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleUploadImage(e, 'POSTER')}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80 text-xs text-blue-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Info size={14} className="text-blue-600 shrink-0" />
                        <span>Tips Desain Poster Agar Tetap Rapi &amp; Senada Website:</span>
                      </div>
                      <ul className="list-disc list-inside text-[11px] text-blue-800 space-y-0.5 pl-1">
                        <li>Gunakan ukuran seragam <strong>1080 x 1350 px (Rasio 4:5)</strong>.</li>
                        <li>Gunakan latar bersih (Putih/Silver Studio atau Hitam Carbon) dan aksen Merah Toyota (<code>#EB0A1E</code>).</li>
                        <li>Hindari terlalu banyak teks kecil di pinggir gambar agar tetap terbaca jelas di layar HP.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Urutan Tampil */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Urutan Tampil (Angka Kecil di Awal)
                    </label>
                    <input
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Pesan WA Kustom (Opsional)
                    </label>
                    <input
                      type="text"
                      value={waCustomMessage}
                      onChange={(e) => setWaCustomMessage(e.target.value)}
                      placeholder="Kosongkan untuk pesan otomatis..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Tombol Simpan */}
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingCarImage || uploadingCustomImage}
                    className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    <span>
                      {editingFlyer ? 'Simpan Perubahan' : 'Simpan & Tayangkan Flyer'}
                    </span>
                  </button>
                </div>
              </div>

              {/* ── KOLOM KANAN: LIVE PREVIEW REAL-TIME (5 Kolom) ── */}
              <div className="lg:col-span-5 flex flex-col">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">
                  Pratinjau Langsung (Live Preview)
                </span>
                <div className="bg-gray-100 rounded-2xl p-4 border border-gray-200 flex-1 flex flex-col items-center justify-center">
                  <div className="w-full max-w-[310px] bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
                    <FlyerPosterCanvas
                      flyer={{
                        mode,
                        theme,
                        title: title || 'All New Avanza',
                        eventTag: eventTag || 'TOYOTA SPEKTAKULER',
                        subtitle: subtitle || 'OTR Batam • Syarat & Ketentuan Berlaku',
                        carImageUrl,
                        customImageUrl,
                        highlight1Label: highlight1Label || 'Cicilan Mulai',
                        highlight1Value: highlight1Value || '3 Jtan',
                        highlight2Label: highlight2Label || 'DP Mulai',
                        highlight2Value: highlight2Value || '15%',
                        benefits,
                      }}
                    />
                    <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                      <span className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-[11px] font-semibold">
                        Unit ↗
                      </span>
                      <span className="flex-1 bg-red-600 text-white py-1.5 px-3 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1">
                        <MessageCircle size={13} />
                        <span>Klaim Promo via WA</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 text-center mt-3">
                    Tampilan kartu flyer di atas adalah bentuk nyata yang akan dilihat pengunjung di halaman utama.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

