'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Upload,
  Loader2,
  X,
  Check,
  Pencil,
  Star,
  Sparkles,
  MapPin,
  Car,
  CheckCircle2,
  HeartHandshake,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import type { TestimonialItem } from '@/types';

interface TestimonialClientProps {
  initialTestimonials: TestimonialItem[];
  carNames: string[];
}

type ReviewTopic = 'ALL' | 'KREDIT' | 'PELAYANAN' | 'PROMO' | 'PENGIRIMAN' | 'KELUARGA';

// ── 50+ Variasi Kalimat Testimoni Natural Khas Pembeli Mobil di Batam ──
// Menggunakan placeholder {mobil} yang otomatis diganti dengan nama unit yang dipilih
const REVIEW_TEMPLATES: Record<Exclude<ReviewTopic, 'ALL'>, string[]> = {
  KREDIT: [
    'Alhamdulillah proses kredit {mobil} cepat banget dan gak ribet. Berkas dijemput ke rumah dan dibantu penuh sampai approve. Terima kasih banyak!',
    'Awalnya sempat ragu pengajuan kredit bakal lama, ternyata dibantu sampai tuntas dan keluar persetujuan dalam hitungan hari. Unit {mobil} langsung mendarat di garasi!',
    'Simulasi cicilan {mobil} dijelaskan dengan sangat transparan dari awal. Proses leasing dibantu sampai tembus dengan DP yang sangat meringankan.',
    'Terima kasih atas bantuannya! Pengajuan kredit {mobil} kami berjalan mulus tanpa kendala, semua persyaratan diurus dengan sangat profesional.',
    'Proses kredit paling sat-set di Batam! Dari tanya-tanya lewat WA sampai unit {mobil} diserahterimakan semuanya serba mudah dan dibantu maksimal.',
    'Sangat terbantu untuk pengurusan kredit {mobil}. Komunikasi lancar, data kurang langsung dibantu arahkan sampai akhirnya approved dan unit dikirim.',
    'Cicilan {mobil} sesuai banget dengan budget bulanan kami. Proses survei sampai akad kredit dikawal terus oleh salesnya. Mantap pelayanannya!',
    'Gak nyangka proses kredit {mobil} bisa secepat ini. Hari ini lengkapi berkas, gak pakai lama langsung dapat kabar baik unit siap dikirim.',
    'Buat yang mau ambil {mobil} secara kredit di Batam, jangan ragu. Hitungannya jelas, gak ada biaya tersembunyi, dan dibantu sampai benar-benar approve!',
    'Pengalaman ambil kredit {mobil} yang sangat menyenangkan. Semua dipermudah dari awal pengajuan sampai mobil tiba di rumah.',
  ],
  PELAYANAN: [
    'Pelayanan sangat ramah, sabar, dan responsif menjawab semua pertanyaan kami soal {mobil}. Dari konsultasi tipe varian sampai serah terima semuanya bintang lima!',
    'Salesnya sangat komunikatif dan jujur memberikan saran tipe {mobil} yang paling pas buat kebutuhan kami. Di-chat malam pun tetap dibalas dengan ramah.',
    'Baru kali ini beli mobil pelayanannya se-prima ini. Semua fitur {mobil} dijelaskan dengan detail saat serah terima unit. Sukses selalu!',
    'Sangat direkomendasikan buat warga Batam yang cari Toyota! Pelayanannya tulus, gak memaksa, dan bener-bener mencarikan solusi terbaik buat ambil {mobil}.',
    'Respons cepat, ramah, dan sangat menguasai produk {mobil}. Mulai dari test drive sampai pengurusan STNK dan pelat nomor dikabari terus progresnya.',
    'Terima kasih atas pelayanan terbaiknya! Dari awal hanya tanya harga {mobil} via WhatsApp, dilayani dengan sangat sopan sampai akhirnya kami mantap SPK.',
    'Pelayanan after-sales dan serah terima {mobil} yang luar biasa. Semua tombol dan fitur mobil dipandu satu per satu dengan sabar saat unit tiba.',
    'Sales Toyota paling komunikatif di Batam. Setiap tahapan pemesanan {mobil} selalu di-update tanpa harus kita tanya duluan. Sangat profesional!',
    'Beli {mobil} jadi terasa tenang dan nyaman karena ditangani oleh sales resmi yang berpengalaman dan sangat kooperatif.',
    'Bintang 5 untuk keramahan dan kesabarannya! Konsultasi dari bulan lalu akhirnya berbuah manis dengan hadirnya {mobil} di rumah kami.',
  ],
  PROMO: [
    'Dapat penawaran harga OTR dan promo paket kredit {mobil} paling mantap se-Batam! Bonus aksesorisnya juga lengkap sesuai janji di awal.',
    'Sudah bandingkan ke beberapa tempat, akhirnya balik ke sini karena hitungan DP dan diskon {mobil}-nya paling masuk akal dan menguntungkan.',
    'Promo {mobil} bulan ini bener-bener menguntungkan! Dapat bunga ringan ditambah bonus kaca film dan aksesoris resmi yang langsung terpasang rapi.',
    'Senang banget bisa dapat program promo spesial untuk {mobil}. Hemat banyak di DP dan angsuran bulanannya juga jauh lebih ringan.',
    'Harga terbaik di Batam! Selain dapat diskon menarik untuk unit {mobil}, kami juga dapat banyak bonus tambahan yang sangat bermanfaat.',
    'Penawaran paket kredit {mobil} yang diberikan sangat fleksibel dan ringan di kantong. Terima kasih sudah memberikan hitungan terbaik untuk keluarga kami!',
    'Tidak salah pilih tempat beli {mobil} di Batam. Promo DP ringan dan bonus kelengkapan mobilnya semua diberikan penuh tanpa kurang satu pun.',
    'Puas banget dengan penawaran harga {mobil}-nya. Hitungan transparan, diskon maksimal, dan gratis aksesorisnya langsung terpasang saat mobil diantar.',
    'Klaim promo {mobil} lewat website langsung direspons cepat dan dapat harga spesial sesuai yang tertera. Mantap dan sangat amanah!',
    'Terima kasih sudah dikasih penawaran paling spesial buat {mobil} impian kami. Sukses dan laris manis terus penjualannya!',
  ],
  PENGIRIMAN: [
    'Unit {mobil} diantar langsung ke rumah tepat sesuai jadwal yang dijanjikan. Kondisi mobil kinclong, bersih, dan siap langsung dipakai jalan!',
    'Proses serah terima {mobil} sangat berkesan! Mobil tiba di rumah dalam kondisi mulus sempurna, dokumen lengkap, dan tepat waktu.',
    'Gak perlu repot bolak-balik ke showroom, tahu-tahu unit {mobil} sudah diantar dengan rapi sampai ke depan teras rumah. Pelayanan juara!',
    'Pengiriman unit {mobil} super cepat karena stoknya ready. Begitu proses administrasi beres, besoknya mobil langsung diantar ke rumah.',
    'Terima kasih! Unit {mobil} pesanan kami mendarat dengan selamat dan tepat waktu bertepatan dengan hari spesial keluarga kami.',
    'Serah terima kunci {mobil} berjalan lancar dan tepat waktu. kondisi eksterior maupun interior dicek bersama dengan sangat teliti.',
    'Janji pengiriman {mobil} sangat tepat waktu. Mobil sudah dipoles bersih, bensin terisi, dan langsung siap dipakai aktivitas di Batam.',
    'Luar biasa cepatnya! Dari SPK sampai serah terima {mobil} di garasi rumah gak pakai nunggu lama. Sangat memuaskan!',
    'Momen serah terima {mobil} yang sangat membahagiakan. Unit diantar langsung dengan pelayanan yang sangat sopan dan profesional.',
    'Unit {mobil} diterima dalam kondisi sempurna tanpa cacat sedikit pun. Penjelasan buku servis dan garansi juga sangat jelas.',
  ],
  KELUARGA: [
    'Akhirnya mobil impian keluarga, {mobil}, resmi parkir di rumah! Kabinnya nyaman banget buat jalan-jalan bareng anak dan keluarga di Batam.',
    'Proses tukar tambah (trade-in) mobil lama ke {mobil} baru berjalan sangat cepat dengan harga taksiran yang tinggi. Terima kasih banyak!',
    'Keluarga besar senang banget menyambut kehadiran {mobil} baru kami. Terima kasih sudah membantu proses pembeliannya dari awal sampai akhir.',
    'Pembelian tunai {mobil} diproses dengan sangat cepat, aman, dan seluruh transaksi resmi langsung ke rekening dealer Agung Toyota Batam.',
    'Pilihan paling tepat ambil {mobil} untuk operasional dan keluarga di Batam. Prosesnya transparan, aman, dan sangat terpercaya.',
    'Terima kasih sudah membantu proses trade-in mobil lama kami menjadi {mobil} gres! Praktis banget gak perlu repot jual mobil lama sendiri.',
    'Anak-anak dan istri senang sekali waktu unit {mobil} tiba di rumah. Terima kasih atas pelayanan terbaik dan kejutan pita serah terimanya!',
    'Sudah pembelian unit kedua kalinya di sini dan pelayanannya tidak pernah mengecewakan. Kali ini tambah unit {mobil} dan prosesnya makin cepat!',
    'Sangat nyaman bertransaksi untuk pembelian {mobil}. Semua pembayaran resmi, dokumen cepat selesai, dan keluarga pun tenang.',
    'Alhamdulillah bertambah lagi armada {mobil} untuk menunjang usaha dan keluarga kami di Batam. Terima kasih atas kerja samanya yang luar biasa!',
  ],
};

const BATAM_LOCATIONS = [
  'Batam Centre',
  'Nagoya',
  'Batu Aji',
  'Tiban',
  'Sekupang',
  'Bengkong',
  'Lubuk Baja',
  'Nongsa',
  'Batu Ampar',
  'Kabil / Punggur',
];

export default function TestimonialClient({
  initialTestimonials,
  carNames,
}: TestimonialClientProps) {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(initialTestimonials);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [carName, setCarName] = useState('');
  const [location, setLocation] = useState('Batam Centre');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState<ReviewTopic>('ALL');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fungsi Generator Kalimat Review Cerdas (50+ Variasi Kontekstual)
  const generateSmartReview = (topicOverride?: ReviewTopic, targetCarName?: string) => {
    const activeTopic = topicOverride ?? selectedTopic;
    const unitLabel = (targetCarName ?? carName).trim() || 'Toyota';

    let pool: string[] = [];
    if (activeTopic === 'ALL') {
      pool = Object.values(REVIEW_TEMPLATES).flat();
    } else {
      pool = REVIEW_TEMPLATES[activeTopic];
    }

    // Hindari memilih kalimat yang sama persis dengan yang sedang tampil
    const candidates = pool.filter(
      (tpl) => tpl.replace(/\{mobil\}/g, unitLabel) !== review
    );
    const sourcePool = candidates.length > 0 ? candidates : pool;
    const randomTemplate =
      sourcePool[Math.floor(Math.random() * sourcePool.length)];

    const generated = randomTemplate.replace(/\{mobil\}/g, unitLabel);
    setReview(generated);
  };

  const openCreateModal = () => {
    const defaultCar = carNames[0] || 'All New Avanza';
    setEditingItem(null);
    setCustomerName('');
    setCarName(defaultCar);
    setLocation('Batam Centre');
    setRating(5);
    setImageUrl('');
    setDisplayOrder(testimonials.length);
    setSelectedTopic('ALL');

    // Langsung isikan 1 kalimat otomatis awal agar admin tidak melihat kotak kosong
    const allTemplates = Object.values(REVIEW_TEMPLATES).flat();
    const initialTpl = allTemplates[Math.floor(Math.random() * allTemplates.length)];
    setReview(initialTpl.replace(/\{mobil\}/g, defaultCar));

    setModalOpen(true);
  };

  const openEditModal = (item: TestimonialItem) => {
    setEditingItem(item);
    setCustomerName(item.customerName);
    setCarName(item.carName);
    setLocation(item.location || '');
    setRating(item.rating || 5);
    setReview(item.review);
    setImageUrl(item.imageUrl);
    setDisplayOrder(item.displayOrder || 0);
    setSelectedTopic('ALL');
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', 'car'); // max width 1080px, tajam & hemat ukuran untuk portrait

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Gagal mengunggah foto serah terima');
      const data = await res.json();
      setImageUrl(data.url);
      toast.success('Foto serah terima berhasil diunggah.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error upload';
      toast.error(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !carName.trim() || !review.trim() || !imageUrl) {
      toast.error('Nama pelanggan, unit mobil, kalimat review, dan foto serah terima wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        carName: carName.trim(),
        location: location.trim() || null,
        rating: Number(rating) || 5,
        review: review.trim(),
        imageUrl,
        displayOrder: Number(displayOrder) || 0,
      };

      if (editingItem) {
        const res = await fetch(`/api/testimonials/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Gagal memperbarui testimoni');
        const updated = await res.json();
        setTestimonials((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
        toast.success('Testimoni berhasil diperbarui.');
      } else {
        const res = await fetch('/api/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, isActive: true }),
        });
        if (!res.ok) throw new Error('Gagal menyimpan testimoni');
        const created = await res.json();
        setTestimonials((prev) => [...prev, created]);
        toast.success('Testimoni baru berhasil ditambahkan!');
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

  const toggleActive = async (item: TestimonialItem) => {
    try {
      const res = await fetch(`/api/testimonials/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (!res.ok) throw new Error('Gagal mengubah status');
      const updated = await res.json();
      setTestimonials((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      toast.success(
        `Testimoni ${item.customerName} ${updated.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`
      );
      router.refresh();
    } catch {
      toast.error('Gagal mengubah status testimoni.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus testimoni dari "${name}"?`)) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus testimoni');
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      toast.success('Testimoni berhasil dihapus.');
      router.refresh();
    } catch {
      toast.error('Gagal menghapus testimoni.');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Testimoni & Momen Serah Terima
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola foto serah terima unit (Portrait) dan ulasan kepuasan pelanggan yang tampil di bawah profil sales pada halaman utama.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Tambah Testimoni</span>
        </button>
      </div>

      {/* ── Grid Daftar Testimoni ── */}
      {testimonials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
            <HeartHandshake size={24} />
          </div>
          <h3 className="text-base font-bold text-gray-900">
            Belum Ada Testimoni & Foto Serah Terima
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
            Klik tombol <strong>&ldquo;Tambah Testimoni&rdquo;</strong> di kanan atas untuk mengunggah foto serah terima mobil dan membuat kalimat review otomatis hanya dengan 1 klik.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border overflow-hidden shadow-xs flex flex-col transition-all ${
                item.isActive ? 'border-gray-200' : 'border-gray-200 opacity-60'
              }`}
            >
              {/* Foto Portrait 3:4 */}
              <div className="relative w-full aspect-[3/4] bg-zinc-900 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.customerName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-600 text-white shadow-sm">
                    <Car size={12} />
                    <span>{item.carName}</span>
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm ${
                      item.isActive
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-white'
                    }`}
                  >
                    {item.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                {/* Bottom Customer Info */}
                <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                  <p className="font-bold text-sm sm:text-base truncate">
                    {item.customerName}
                  </p>
                  {item.location && (
                    <p className="text-[11px] text-zinc-200 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-red-400" />
                      <span>{item.location}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Isi Review */}
              <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                <div>
                  <div className="flex items-center gap-0.5 text-amber-400 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < (item.rating || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-200'
                        }
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 italic line-clamp-3">
                    &ldquo;{item.review}&rdquo;
                  </p>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleActive(item)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    item.isActive
                      ? 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                      : 'border-green-600 bg-white text-green-600 hover:bg-green-50'
                  }`}
                >
                  <Check size={13} />
                  <span>{item.isActive ? 'Nonaktifkan' : 'Aktifkan'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Pencil size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.customerName)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Testimoni"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL TAMBAH / EDIT TESTIMONI DENGAN SMART REVIEW GENERATOR ── */}
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
              {editingItem
                ? `Edit Testimoni: ${editingItem.customerName}`
                : 'Tambah Testimoni & Serah Terima Baru'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 mb-5">
              Unggah foto portrait serah terima mobil, pilih unit, dan gunakan fitur <strong>1-Klik Buat Kalimat Review Otomatis</strong> jika tidak sempat mengarang ulasan.
            </p>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* ── KOLOM KIRI: INPUT DATA & GENERATOR (7 Kolom) ── */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1. Upload Foto Serah Terima (Portrait) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    1. Foto Serah Terima Unit (Portrait / Vertikal) *
                  </label>
                  <label className="flex items-center justify-center gap-2.5 px-4 py-3.5 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-500 hover:bg-red-50/20 transition-colors">
                    {uploadingImage ? (
                      <Loader2 size={18} className="animate-spin text-red-600" />
                    ) : (
                      <Upload size={18} className="text-red-600" />
                    )}
                    <span className="text-xs font-semibold text-gray-700">
                      {uploadingImage
                        ? 'Mengunggah foto...'
                        : imageUrl
                        ? 'Ganti Foto Serah Terima'
                        : 'Pilih & Upload Foto Serah Terima (JPG / PNG / WebP)'}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* 2. Nama Pembeli & Pilihan Unit Mobil */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nama Pelanggan / Keluarga *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Contoh: Bpk. Hendra & Keluarga"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Unit Mobil yang Dibeli *
                    </label>
                    <div className="flex gap-1.5">
                      <select
                        value={carNames.includes(carName) ? carName : '__CUSTOM__'}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val !== '__CUSTOM__') {
                            setCarName(val);
                            // Update nama mobil di kalimat review otomatis jika masih memakai nama mobil sebelumnya
                            if (carName && review.includes(carName)) {
                              setReview(review.replaceAll(carName, val));
                            }
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                      >
                        {carNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                        <option value="__CUSTOM__">+ Ketik Nama Tipe Lainnya...</option>
                      </select>
                    </div>
                    {!carNames.includes(carName) && (
                      <input
                        type="text"
                        value={carName}
                        onChange={(e) => setCarName(e.target.value)}
                        placeholder="Ketik nama mobil (misal: Toyota Rush GR)"
                        className="w-full mt-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                      />
                    )}
                  </div>
                </div>

                {/* 3. Lokasi / Area Batam & Rating Bintang */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Domisili / Area Pelanggan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Contoh: Batam Centre"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {BATAM_LOCATIONS.slice(0, 5).map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setLocation(loc)}
                          className={`text-[10px] px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                            location === loc
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Rating Kepuasan Pelanggan
                    </label>
                    <div className="flex items-center gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          <Star
                            size={18}
                            className={
                              star <= rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-gray-700 ml-1">
                        {rating}.0 / 5.0
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Smart Review Generator (1-Klik 50+ Variasi Kalimat) */}
                <div className="p-4 bg-red-50/40 rounded-xl border border-red-100 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <Sparkles size={15} className="text-red-600" />
                        <span>Kalimat Testimoni &amp; Generator Cerdas (50+ Variasi)</span>
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        Pilih topik lalu klik tombol acak untuk membuat kalimat review otomatis sesuai nama mobil, atau edit manual di bawah.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => generateSmartReview()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                      <RefreshCw size={13} />
                      <span>Acak Kalimat Lain</span>
                    </button>
                  </div>

                  {/* Filter Topik Kalimat */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'ALL', label: '🎲 Semua Topik' },
                      { id: 'KREDIT', label: '⚡ Kredit Cepat Approve' },
                      { id: 'PELAYANAN', label: '🤝 Sales Ramah & Sabar' },
                      { id: 'PROMO', label: '🔥 Diskon & Promo Mantap' },
                      { id: 'PENGIRIMAN', label: '🚚 Pengiriman Tepat Waktu' },
                      { id: 'KELUARGA', label: '👨‍👩‍👧‍👦 Keluarga & Trade-In' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          const topic = t.id as ReviewTopic;
                          setSelectedTopic(topic);
                          generateSmartReview(topic);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                          selectedTopic === t.id
                            ? 'bg-zinc-900 text-white shadow-2xs'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Textarea Review */}
                  <textarea
                    rows={3}
                    required
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Ketik ulasan pelanggan atau klik tombol 'Acak Kalimat Lain' di atas..."
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                {/* Urutan Tampil */}
                <div className="w-40">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                {/* Tombol Simpan */}
                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    <span>
                      {editingItem ? 'Simpan Perubahan' : 'Simpan & Tayangkan Testimoni'}
                    </span>
                  </button>
                </div>
              </div>

              {/* ── KOLOM KANAN: LIVE PREVIEW KARTU TESTIMONI (5 Kolom) ── */}
              <div className="lg:col-span-5 flex flex-col">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">
                  Pratinjau Langsung (Live Preview)
                </span>
                <div className="bg-gray-100 rounded-2xl p-4 border border-gray-200 flex-1 flex flex-col items-center justify-center">
                  <div className="w-full max-w-[290px] bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden flex flex-col">
                    {/* Foto Portrait 3:4 */}
                    <div className="relative w-full aspect-[3/4] bg-zinc-900 overflow-hidden flex items-center justify-center">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Preview Serah Terima"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-6 text-zinc-400">
                          <HeartHandshake
                            size={32}
                            className="mx-auto mb-2 text-red-500 opacity-80"
                          />
                          <p className="text-xs font-semibold">
                            Belum ada foto serah terima
                          </p>
                          <p className="text-[11px] text-zinc-500 mt-1">
                            Unggah foto potret (rasio 3:4)
                          </p>
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-600 text-white shadow-sm">
                          <Car size={12} />
                          <span>{carName || 'All New Avanza'}</span>
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                        <p className="font-bold text-sm truncate">
                          {customerName || 'Bpk. Hendra & Keluarga'}
                        </p>
                        {location && (
                          <p className="text-[11px] text-zinc-200 flex items-center gap-1 mt-0.5">
                            <MapPin size={11} className="text-red-400" />
                            <span>{location}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Review Area */}
                    <div className="p-3.5 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              className={
                                i < rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-200'
                              }
                            />
                          ))}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={10} />
                          <span>Terverifikasi</span>
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs leading-relaxed italic line-clamp-3">
                        &ldquo;{review || 'Proses cepat dan pelayanan sangat ramah!'}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

