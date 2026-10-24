'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit3, Trash2, Car, Eye, EyeOff } from 'lucide-react';
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
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleActive = async (id: string, currentStatus: boolean, name: string) => {
    const newStatus = !currentStatus;
    setTogglingId(id);

    // Optimistic UI update
    setCars((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: newStatus } : c))
    );

    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal mengubah status unit');
      }

      toast.success(
        `Unit "${name}" berhasil ${
          newStatus ? 'diaktifkan (tayang di katalog)' : 'dinonaktifkan (disembunyikan dari katalog)'
        }.`
      );
      router.refresh();
    } catch (err: unknown) {
      // Revert status on failure
      setCars((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: currentStatus } : c))
      );
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengubah status.';
      toast.error(message);
    } finally {
      setTogglingId(null);
    }
  };

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
            Kelola model kendaraan, tipe varian, dan harga dasar OTR Batam.
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
                    <button
                      type="button"
                      disabled={togglingId === car.id}
                      onClick={() => handleToggleActive(car.id, car.isActive, car.name)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        car.isActive
                          ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 hover:border-green-300'
                          : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200 hover:text-gray-700'
                      } disabled:opacity-50`}
                      title={car.isActive ? 'Klik untuk Nonaktifkan (Sembunyikan dari Publik)' : 'Klik untuk Aktifkan (Tayangkan ke Publik)'}
                    >
                      {togglingId === car.id ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                      ) : (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            car.isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                      )}
                      <span>{car.isActive ? 'Aktif (Tayang)' : 'Nonaktif (Draft)'}</span>
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        disabled={togglingId === car.id}
                        onClick={() => handleToggleActive(car.id, car.isActive, car.name)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                          car.isActive
                            ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={car.isActive ? 'Nonaktifkan Unit (Sembunyikan dari Publik)' : 'Aktifkan Unit (Tayangkan ke Publik)'}
                      >
                        {car.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
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
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
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
                  <td colSpan={5} className="py-12 text-center text-gray-400">
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
