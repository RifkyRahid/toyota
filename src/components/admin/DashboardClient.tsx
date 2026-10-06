'use client';

import { FileDown } from 'lucide-react';
import AnalyticsChart from './AnalyticsChart';
import { generatePerformancePdf } from '@/lib/pdf-report';
import { toast } from 'sonner';

interface DashboardClientProps {
  totalLeads: number;
  newLeads: number;
  dealLeads: number;
  totalCars: number;
  topCars: Array<{
    id: string;
    name: string;
    category: string;
    startingPrice: string;
    isPromo: boolean;
    leadCount: number;
  }>;
  recentLeads: Array<{
    id: string;
    name: string;
    whatsapp: string;
    carInterest?: string | null;
    status: string;
    createdAt: string;
  }>;
  hourlyData?: number[];
  totalClicks?: number;
}

export default function DashboardClient({
  totalLeads,
  newLeads,
  dealLeads,
  totalCars,
  topCars,
  recentLeads,
  hourlyData = [],
  totalClicks = 0,
}: DashboardClientProps) {
  const handleDownloadPdf = () => {
    try {
      generatePerformancePdf({
        totalLeads,
        newLeads,
        dealLeads,
        topCars,
        recentLeads,
      });
      toast.success('Laporan PDF berhasil diunduh.');
    } catch (err) {
      console.error(err);
      toast.error('Gagal membuat laporan PDF.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header with PDF Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Dasbor Analitik & Penjualan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau metrik prospek, tren aktivitas calon pembeli, dan popularitas unit Toyota.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadPdf}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <FileDown size={17} />
          <span>Download Laporan Performa (PDF)</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Total Prospek Masuk
          </span>
          <p className="text-3xl font-black text-gray-900 mt-2">{totalLeads}</p>
          <span className="text-[11px] text-gray-500 mt-1 block">Semua formulir & unduh pricelist</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-red-600 uppercase tracking-wider block">
            Prospek Baru
          </span>
          <p className="text-3xl font-black text-red-600 mt-2">{newLeads}</p>
          <span className="text-[11px] text-gray-500 mt-1 block">Menunggu follow-up sales</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-green-600 uppercase tracking-wider block">
            Prospek Deal (Terjual)
          </span>
          <p className="text-3xl font-black text-green-700 mt-2">{dealLeads}</p>
          <span className="text-[11px] text-gray-500 mt-1 block">Transaksi berhasil disetujui</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Unit Terdaftar di Katalog
          </span>
          <p className="text-3xl font-black text-gray-900 mt-2">{totalCars || topCars.length}</p>
          <span className="text-[11px] text-gray-500 mt-1 block">Model mobil aktif tayang</span>
        </div>
      </div>

      {/* Chart: Peak Hours */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-gray-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Grafik Jam Sibuk Pengunjung (Peak Hours)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Distribusi interaksi pengguna per jam (Pukul 00:00 - 23:00) untuk acuan jadwal penayangan iklan / follow-up.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              Total Klik WA & Interaksi: <strong className="text-gray-900 ml-1">{totalClicks + totalLeads}</strong>
            </span>
            <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-1 rounded border border-gray-200">
              {hourlyData.some((c) => c > 0) ? 'Data Riil' : 'Data Sampel Baseline'}
            </span>
          </div>
        </div>

        <AnalyticsChart data={hourlyData} />
      </div>

      {/* 2-Columns: Top 10 Cars + Latest Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 10 Cars */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Top 10 Mobil Paling Diminati
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Berdasarkan data klik CTA WhatsApp & prospek masuk</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">Model Mobil</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Harga OTR Mulai</th>
                  <th className="py-3 px-4 text-right">Minat / Klik WA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topCars.slice(0, 10).map((car, idx) => (
                  <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-400">#{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {car.name}
                      {car.isPromo && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 font-bold rounded">
                          PROMO
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">{car.category}</td>
                    <td className="py-3 px-4 font-bold text-red-600">
                      Rp {Number(car.startingPrice).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          car.leadCount > 0
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-gray-50 text-gray-400'
                        }`}
                      >
                        {car.leadCount} interaksi
                      </span>
                    </td>
                  </tr>
                ))}
                {topCars.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">
                      Belum ada data unit mobil.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                10 Prospek Terbaru
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Calon pembeli yang baru saja mengisi form</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama</th>
                  <th className="py-3 px-4">WhatsApp</th>
                  <th className="py-3 px-4">Unit Minat</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLeads.slice(0, 10).map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-900">{lead.name}</td>
                    <td className="py-3 px-4">
                      <a
                        href={`https://wa.me/${lead.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline font-mono font-medium"
                      >
                        {lead.whatsapp}
                      </a>
                    </td>
                    <td className="py-3 px-4 truncate max-w-[120px]">
                      {lead.carInterest || 'Umum'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentLeads.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">
                      Belum ada data prospek masuk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
