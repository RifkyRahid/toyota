'use client';

import { useState, Fragment } from 'react';
import Link from 'next/link';
import type { SerializedCarModel, SiteSetting } from '@/types';
import { formatRupiah } from '@/lib/format';
import LeadModal from '@/components/public/LeadModal';

export default function DaftarHargaClient({ cars, settings }: { cars: SerializedCarModel[]; settings: Partial<SiteSetting> }) {
  const [modalOpen, setModalOpen] = useState(false);
  
  if (!cars || cars.length === 0) {
    return (
      <div className="container mx-auto px-4 text-center py-20">
        <p className="text-gray-400 text-lg">Daftar harga belum tersedia.</p>
      </div>
    );
  }

  // Group cars by category
  const groupedCars = cars.reduce((acc, car) => {
    const category = car.category || 'LAINNYA';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(car);
    return acc;
  }, {} as Record<string, SerializedCarModel[]>);

  const categories = Object.keys(groupedCars).sort();

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg shadow-sm transition-colors"
        >
          Download Pricelist PDF
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold">
              <th className="p-4 border-b">No</th>
              <th className="p-4 border-b">Tipe Mobil</th>
              <th className="p-4 border-b">Kategori</th>
              <th className="p-4 border-b">Harga OTR Mulai</th>
              <th className="p-4 border-b">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <Fragment key={category}>
                <tr className="bg-gray-50">
                  <td colSpan={5} className="p-3 border-b font-bold text-gray-800 uppercase">
                    {category}
                  </td>
                </tr>
                {groupedCars[category].map((car, index) => (
                  <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 border-b text-gray-600">{index + 1}</td>
                    <td className="p-4 border-b text-gray-900 font-medium">{car.name}</td>
                    <td className="p-4 border-b text-gray-600">{car.category}</td>
                    <td className="p-4 border-b text-gray-900 font-semibold">{formatRupiah(car.startingPrice)}</td>
                    <td className="p-4 border-b">
                      <Link href={`/mobil/${car.slug}`} className="text-red-600 hover:text-red-800 text-sm font-semibold">
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <LeadModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        pricelistPdfUrl={settings.pricelistPdfUrl}
        salesWhatsapp={settings.salesWhatsapp ?? ''}
      />
    </div>
  );
}

