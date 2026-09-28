'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BulkVariantItem {
  id: string;
  name: string;
  price: string;
  carModelId: string;
  carName: string;
  category: string;
}

interface BulkPriceClientProps {
  initialVariants: BulkVariantItem[];
}

export default function BulkPriceClient({ initialVariants }: BulkPriceClientProps) {
  const router = useRouter();
  const [variants, setVariants] = useState<BulkVariantItem[]>(initialVariants);
  const [editedPrices, setEditedPrices] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePriceChange = (variantId: string, newPrice: string) => {
    setEditedPrices((prev) => ({
      ...prev,
      [variantId]: newPrice,
    }));
  };

  const hasChanges = Object.keys(editedPrices).length > 0;

  const handleSaveAll = async () => {
    if (!hasChanges) {
      toast.info('Tidak ada perubahan harga untuk disimpan.');
      return;
    }

    setSaving(true);
    const updates = Object.entries(editedPrices).map(([id, priceStr]) => ({
      id,
      price: Number(priceStr),
    }));

    try {
      const res = await fetch('/api/cars/bulk-price', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menyimpan perubahan harga');
      }

      toast.success(`${updates.length} harga varian OTR Batam berhasil diperbarui!`);

      // Update local state
      setVariants((prev) =>
        prev.map((v) => {
          if (editedPrices[v.id]) {
            return { ...v, price: editedPrices[v.id] };
          }
          return v;
        })
      );
      setEditedPrices({});
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan server.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = variants.filter(
    (v) =>
      v.carName.toLowerCase().includes(search.toLowerCase()) ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Editor Harga Massal (Bulk Price OTR Batam)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ubah harga OTR seluruh tipe mobil secara cepat dalam satu halaman. Nilai starting price model akan otomatis disinkronkan.
          </p>
        </div>

        <button
          type="button"
          disabled={!hasChanges || saving}
          onClick={handleSaveAll}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer self-start"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Menyimpan Semua...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>
                Simpan Semua Harga {hasChanges && `(${Object.keys(editedPrices).length})`}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
        <Search size={18} className="text-gray-400 ml-1" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari berdasarkan model (misal: Avanza, Fortuner), varian, atau kategori..."
          className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
          >
            Reset
          </button>
        )}
      </div>

      {/* Bulk Price Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4">Model Mobil</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Tipe / Varian</th>
                <th className="py-3.5 px-4">Harga OTR Batam Saat Ini</th>
                <th className="py-3.5 px-4 w-60">Harga OTR Baru (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((v) => {
                const isModified = Boolean(editedPrices[v.id]);
                const currentVal = editedPrices[v.id] ?? v.price;

                return (
                  <tr
                    key={v.id}
                    className={`transition-colors ${
                      isModified ? 'bg-amber-50/60' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-gray-900">{v.carName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                        {v.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{v.name}</td>
                    <td className="py-3 px-4 font-mono text-gray-500">
                      Rp {Number(v.price).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <input
                          type="number"
                          value={currentVal}
                          onChange={(e) => handlePriceChange(v.id, e.target.value)}
                          className={`w-full px-3 py-1.5 rounded-lg text-sm font-mono focus:outline-none transition-all ${
                            isModified
                              ? 'bg-white border-2 border-amber-500 font-bold text-amber-900'
                              : 'bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-red-600'
                          }`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    Tidak ditemukan varian yang sesuai kata kunci.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
