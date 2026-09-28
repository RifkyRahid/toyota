'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit3, Trash2, Tag, Car } from 'lucide-react';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/format';
import type { SerializedCarModel } from '@/types';

interface KatalogListClientProps {
  cars: SerializedCarModel[];
}

export default function KatalogListClient({ cars: initialCars }: KatalogListClientProps) {
  const router = useRouter();
  const [cars, setCars] = useState(initialCars);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus model "${name}" beserta seluruh variannya?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/cars/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus unit');
      }

      setCars((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Model "${name}" berhasil dihapus.`);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus.';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Katalog Unit Mobil
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola model kendaraan, tipe varian, harga dasar OTR Batam, dan badge promo.
          </p>
        </div>

        <Link
          href="/admin/katalog/tambah"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors self-start"
        >
          <Plus size={17} />
          <span>Tambah Unit Mobil</span>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4">Mobil</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Harga OTR Mulai</th>
                <th className="py-3.5 px-4">Status Promo</th>
                <th className="py-3.5 px-4">Status Tayang</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cars.map((car) => (
                <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-10 bg-gray-50 rounded-md border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                        {car.heroImage ? (
                          <img
                            src={car.heroImage}
                            alt={car.name}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <Car size={18} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">{car.name}</span>
                        <span className="text-xs text-gray-400 font-mono">/{car.slug}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md">
                      {car.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-red-600">
                    {formatRupiah(car.startingPrice)}
                  </td>

                  <td className="py-3.5 px-4">
                    {car.isPromo ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                        <Tag size={12} />
                        <span>{car.promoLabel || 'PROMO'}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">Bukan Promo</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {car.isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        Nonaktif
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/katalog/${car.id}`}
                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Model & Varian"
                      >
                        <Edit3 size={16} />
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === car.id}
                        onClick={() => handleDelete(car.id, car.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Hapus Model"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {cars.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Belum ada mobil terdaftar. Klik &quot;Tambah Unit Mobil&quot; untuk menambahkan.
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
