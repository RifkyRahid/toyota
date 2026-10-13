'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FileDown, RotateCcw, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import AnalyticsChart, { type HourlyMeta } from './AnalyticsChart';
import ReportModal from './ReportModal';

type ChartFilterType = 'today' | '7d' | '30d' | 'all';

interface DashboardClientProps {
  totalLeads: number;
  newLeads: number;
  dealLeads: number;
  totalCars: number;
  isSuperadmin?: boolean;
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
  allLeads?: Array<{
    id: string;
    name: string;
    whatsapp: string;
    carInterest?: string | null;
    status: string;
    createdAt: string;
  }>;
  allClicks?: Array<{
    carName?: string | null;
    buttonType: string;
    createdAt: string;
  }>;
  allCars?: Array<{
    id: string;
    name: string;
    category: string;
    startingPrice: string;
    isPromo: boolean;
  }>;
}

export default function DashboardClient({
  totalLeads,
  newLeads,
  dealLeads,
  totalCars,
  topCars,
  recentLeads,
  hourlyData: _hourlyData = [],
  totalClicks: _totalClicks = 0,
  allLeads = [],
  allClicks = [],
  allCars = [],
  isSuperadmin = false,
}: DashboardClientProps) {
  const router = useRouter();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [chartFilter, setChartFilter] = useState<ChartFilterType>('all');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [includeLeadsReset, setIncludeLeadsReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetAnalytics = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/admin/analytics/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeLeads: includeLeadsReset }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal membersihkan data analitik');
      }

      toast.success('Riwayat grafik dan analitik berhasil dibersihkan!');
      setIsResetModalOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      toast.error(msg);
    } finally {
      setIsResetting(false);
    }
  };

  const effectiveLeads = allLeads.length > 0 ? allLeads : recentLeads;
  const effectiveClicks = allClicks;
  const effectiveCars = allCars.length > 0 ? allCars : topCars.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    startingPrice: c.startingPrice,
    isPromo: c.isPromo,
  }));

  // Hitung distribusi jam dan metadata detail secara dinamis berdasarkan filter yang dipilih
  const { activeHourlyData, activeHourlyMeta, activeTotalInteractions, isRealData } = useMemo(() => {
    const now = new Date();
    const todayDateLabel = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    let cutoff = 0;
    let periodLabel = 'Semua Waktu';

    if (chartFilter === 'today') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      cutoff = startOfToday.getTime();
      periodLabel = `Hari Ini (${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})`;
    } else if (chartFilter === '7d') {
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
      const startStr = new Date(cutoff).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const endStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      periodLabel = `7 Hari Terakhir (${startStr} - ${endStr})`;
    } else if (chartFilter === '30d') {
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();
      const startStr = new Date(cutoff).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const endStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      periodLabel = `30 Hari Terakhir (${startStr} - ${endStr})`;
    }

    const filteredClicks = cutoff === 0 
      ? effectiveClicks 
      : effectiveClicks.filter((c) => new Date(c.createdAt).getTime() >= cutoff);
    const filteredLeads = cutoff === 0 
      ? effectiveLeads 
      : effectiveLeads.filter((l) => new Date(l.createdAt).getTime() >= cutoff);

    const dist = Array(24).fill(0);
    const metaArray: HourlyMeta[] = [];

    for (let h = 0; h < 24; h++) {
      const hourClicks = filteredClicks.filter((c) => new Date(c.createdAt).getHours() === h);
      const hourLeads = filteredLeads.filter((l) => new Date(l.createdAt).getHours() === h);
      const totalInHour = hourClicks.length + hourLeads.length;
      dist[h] = totalInHour;

      // Grouping tanggal unik kejadian pada jam ini
      const dateMap = new Map<string, { dateStr: string; dayName: string; count: number; timestamp: number }>();
      for (const item of [...hourClicks, ...hourLeads]) {
        const d = new Date(item.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const existing = dateMap.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          dateMap.set(key, {
            dateStr: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            dayName: d.toLocaleDateString('id-ID', { weekday: 'long' }),
            count: 1,
            timestamp: d.getTime(),
          });
        }
      }
      const dateBreakdown = Array.from(dateMap.values()).sort((a, b) => b.timestamp - a.timestamp);

      // Grouping mobil yang diminati pada jam ini
      const carMap = new Map<string, number>();
      for (const c of hourClicks) {
        if (c.carName) {
          const name = c.carName.trim();
          carMap.set(name, (carMap.get(name) || 0) + 1);
        }
      }
      for (const l of hourLeads) {
        if (l.carInterest) {
          const name = l.carInterest.trim();
          carMap.set(name, (carMap.get(name) || 0) + 1);
        }
      }
      const topCarsInHour = Array.from(carMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => `${name} (${count})`);

      metaArray.push({
        hour: h,
        count: totalInHour,
        dateLabel: todayDateLabel,
        periodLabel,
        clicksCount: hourClicks.length,
        leadsCount: hourLeads.length,
        topCars: topCarsInHour,
        dateBreakdown,
      });
    }

    const totalInteractions = filteredClicks.length + filteredLeads.length;
    const hasReal = dist.some((c: number) => c > 0);

    return {
      activeHourlyData: dist,
      activeHourlyMeta: metaArray,
      activeTotalInteractions: totalInteractions,
      isRealData: hasReal,
    };
  }, [chartFilter, effectiveClicks, effectiveLeads]);

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

        <div className="flex flex-wrap items-center gap-3">
          {isSuperadmin && (
            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-sm font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Khusus Superadmin: Bersihkan data interaksi / klik tes yang terekam saat input unit"
            >
              <RotateCcw size={15} className="text-amber-600" />
              <span>Bersihkan Riwayat Grafik</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <FileDown size={17} />
            <span>Tarik Laporan Kinerja (PDF)</span>
          </button>
        </div>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-gray-100 gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Grafik Jam Sibuk Pengunjung (Peak Hours)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Distribusi interaksi calon pembeli per jam (00:00 - 23:00) untuk acuan jadwal penayangan iklan & stand-by sales.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Filter Tab Rentang Waktu */}
            <div className="inline-flex items-center p-0.5 bg-gray-100 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => setChartFilter('today')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  chartFilter === 'today'
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setChartFilter('7d')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  chartFilter === '7d'
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                7 Hari
              </button>
              <button
                type="button"
                onClick={() => setChartFilter('30d')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  chartFilter === '30d'
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                30 Hari
              </button>
              <button
                type="button"
                onClick={() => setChartFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  chartFilter === 'all'
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Semua
              </button>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              Interaksi: <strong className="text-gray-900 ml-1">{activeTotalInteractions}</strong>
            </span>
            <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-1 rounded border border-gray-200">
              {isRealData ? 'Data Riil' : 'Data Sampel Baseline'}
            </span>
            {isSuperadmin && (
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded border border-amber-200 transition-colors cursor-pointer"
                title="Khusus Superadmin: Reset riwayat grafik hasil testing"
              >
                <RotateCcw size={12} />
                <span>Reset Grafik</span>
              </button>
            )}
          </div>
        </div>

        <AnalyticsChart
          data={activeHourlyData}
          hourlyMeta={activeHourlyMeta}
          filterType={chartFilter}
        />
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

      {/* Modal Dialog Download Laporan Kinerja Digital PDF */}
      <ReportModal
        open={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        allLeads={effectiveLeads}
        allClicks={effectiveClicks}
        allCars={effectiveCars}
      />

      {/* Modal Konfirmasi Bersihkan Riwayat Grafik (Khusus Superadmin) */}
      <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
        <DialogContent className="sm:max-w-md p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Bersihkan Riwayat Grafik & Analitik
              </DialogTitle>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded-full mt-0.5">
                Fitur Khusus Superadmin
              </span>
            </div>
          </div>

          <DialogDescription className="text-sm text-gray-600 space-y-3 mt-2">
            <p>
              Tindakan ini akan mengosongkan seluruh rekaman <strong>klik tombol (CTA)</strong> dan <strong>grafik jam sibuk</strong> yang terakumulasi selama proses input unit &amp; uji coba tombol.
            </p>
            <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
              💡 <strong>Mengapa fitur ini ada:</strong> Saat website sudah live tetapi Anda masih melakukan klik uji coba dan input mobil, data testing tersebut membuat grafik menjadi tidak murni. Tombol ini mengembalikan grafik ke posisi bersih (0).
            </p>
          </DialogDescription>

          <div className="mt-4 p-3 bg-amber-50/70 rounded-lg border border-amber-200/80">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-700 font-medium select-none">
              <input
                type="checkbox"
                checked={includeLeadsReset}
                onChange={(e) => setIncludeLeadsReset(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
              />
              <span>
                Ikut bersihkan juga data formulir prospek (<strong className="text-gray-900">Leads</strong>) hasil testing.
                <span className="block text-[11px] text-gray-500 font-normal mt-0.5">
                  (Biarkan tidak dicentang jika Anda hanya ingin mereset grafik klik dan tetap mempertahankan prospek formulir yang masuk)
                </span>
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={isResetting}
              onClick={() => setIsResetModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isResetting}
              onClick={handleResetAnalytics}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isResetting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Membersihkan...</span>
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  <span>Ya, Bersihkan Riwayat</span>
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
