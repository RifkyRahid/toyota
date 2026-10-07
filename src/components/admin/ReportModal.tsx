'use client';

import { useState, useMemo } from 'react';
import { Calendar, FileDown, Clock, Car, Users, MousePointerClick } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { generatePerformancePdf, type TopCarItem, type LeadReportItem } from '@/lib/pdf-report';
import { toast } from 'sonner';

export type ReportPeriod = 'this_month' | 'last_7_days' | 'last_30_days' | 'all_time' | 'custom';

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allLeads: Array<{
    id: string;
    name: string;
    whatsapp: string;
    carInterest?: string | null;
    status: string;
    createdAt: string;
  }>;
  allClicks: Array<{
    carName?: string | null;
    buttonType: string;
    createdAt: string;
  }>;
  allCars: Array<{
    id: string;
    name: string;
    category: string;
    startingPrice: string;
    isPromo: boolean;
  }>;
}

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function ReportModal({
  open,
  onOpenChange,
  allLeads,
  allClicks,
  allCars,
}: ReportModalProps) {
  const [period, setPeriod] = useState<ReportPeriod>('this_month');

  // Custom date state: format YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const firstDayOfMonthStr = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  }, []);

  const [customStart, setCustomStart] = useState<string>(firstDayOfMonthStr);
  const [customEnd, setCustomEnd] = useState<string>(todayStr);

  // Hitung range tanggal aktif
  const { startDate, endDate, periodLabel } = useMemo(() => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    if (period === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const monthName = start.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      return {
        startDate: start,
        endDate: end,
        periodLabel: `Bulan ${monthName}`,
      };
    }

    if (period === 'last_7_days') {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      const startStr = start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const endStr = end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      return {
        startDate: start,
        endDate: end,
        periodLabel: `7 Hari Terakhir (${startStr} - ${endStr})`,
      };
    }

    if (period === 'last_30_days') {
      const start = new Date(now);
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      const startStr = start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const endStr = end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      return {
        startDate: start,
        endDate: end,
        periodLabel: `30 Hari Terakhir (${startStr} - ${endStr})`,
      };
    }

    if (period === 'all_time') {
      const start = new Date(2020, 0, 1);
      return {
        startDate: start,
        endDate: end,
        periodLabel: 'Semua Waktu (Akumulasi Lengkap)',
      };
    }

    // Custom
    const start = customStart ? new Date(customStart + 'T00:00:00') : new Date(2020, 0, 1);
    const customEndObj = customEnd ? new Date(customEnd + 'T23:59:59') : end;
    const startStr = start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const endStr = customEndObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    return {
      startDate: start,
      endDate: customEndObj,
      periodLabel: `Kustom (${startStr} - ${endStr})`,
    };
  }, [period, customStart, customEnd]);

  // Filter Leads & Clicks berdasarkan periode yang dipilih
  const filteredStats = useMemo(() => {
    const sTime = startDate.getTime();
    const eTime = endDate.getTime();

    const leads = allLeads.filter((l) => {
      const t = new Date(l.createdAt).getTime();
      return t >= sTime && t <= eTime;
    });

    const clicks = allClicks.filter((c) => {
      const t = new Date(c.createdAt).getTime();
      return t >= sTime && t <= eTime;
    });

    // 1. KPI Counts
    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === 'BARU').length;
    const dealLeads = leads.filter((l) => l.status === 'DEAL').length;
    const totalClicks = clicks.length;

    // 2. 24-Hour Distribution
    const hourlyData = Array(24).fill(0);
    const dayCounts = Array(7).fill(0);

    for (const c of clicks) {
      const d = new Date(c.createdAt);
      hourlyData[d.getHours()] += 1;
      dayCounts[d.getDay()] += 1;
    }
    for (const l of leads) {
      const d = new Date(l.createdAt);
      hourlyData[d.getHours()] += 1;
      dayCounts[d.getDay()] += 1;
    }

    // 3. Peak Hours text
    const hourPairs = hourlyData.map((count, hour) => ({ hour, count }));
    hourPairs.sort((a, b) => b.count - a.count);
    const topHours = hourPairs.filter((p) => p.count > 0).slice(0, 2);

    let peakHoursText = '12:00 - 14:00 & 19:00 - 21:00 (Perkiraan)';
    if (topHours.length > 0) {
      peakHoursText = topHours
        .map((h) => `${String(h.hour).padStart(2, '0')}:00 - ${String((h.hour + 1) % 24).padStart(2, '0')}:00`)
        .join(' & ');
    }

    // 4. Peak Day text
    const dayPairs = dayCounts.map((count, day) => ({ day, count }));
    dayPairs.sort((a, b) => b.count - a.count);
    const topDays = dayPairs.filter((p) => p.count > 0).slice(0, 2);

    let peakDayText = 'Jumat s/d Minggu';
    if (topDays.length > 0) {
      peakDayText = topDays.map((d) => DAY_NAMES[d.day]).join(' & ');
    }

    // 5. Mobil paling diminati pada periode ini
    const carScores: Record<string, number> = {};
    for (const car of allCars) {
      const carLower = car.name.toLowerCase();
      let score = 0;
      for (const c of clicks) {
        if (c.carName && c.carName.toLowerCase().includes(carLower)) score += 1;
      }
      for (const l of leads) {
        if (l.carInterest && l.carInterest.toLowerCase().includes(carLower)) score += 1;
      }
      carScores[car.id] = score;
    }

    const sortedCars: TopCarItem[] = [...allCars]
      .sort((a, b) => (carScores[b.id] || 0) - (carScores[a.id] || 0))
      .slice(0, 5)
      .map((c) => ({
        name: c.name,
        category: c.category,
        startingPrice: c.startingPrice,
        leadCount: carScores[c.id] || 0,
      }));

    const topCarName = sortedCars[0] ? `${sortedCars[0].name} (${sortedCars[0].leadCount} interaksi)` : '-';

    const recentLeads: LeadReportItem[] = leads.slice(0, 8).map((l) => ({
      createdAt: l.createdAt,
      name: l.name,
      whatsapp: l.whatsapp,
      carInterest: l.carInterest,
      status: l.status,
    }));

    return {
      totalLeads,
      newLeads,
      dealLeads,
      totalClicks,
      hourlyData,
      peakHoursText,
      peakDayText,
      topCars: sortedCars,
      topCarName,
      recentLeads,
    };
  }, [startDate, endDate, allLeads, allClicks, allCars]);

  const handleDownload = () => {
    try {
      generatePerformancePdf({
        periodLabel,
        totalLeads: filteredStats.totalLeads,
        newLeads: filteredStats.newLeads,
        dealLeads: filteredStats.dealLeads,
        totalClicks: filteredStats.totalClicks,
        topCars: filteredStats.topCars,
        recentLeads: filteredStats.recentLeads,
        hourlyData: filteredStats.hourlyData,
        peakHoursText: filteredStats.peakHoursText,
        peakDayText: filteredStats.peakDayText,
      });

      toast.success(`Laporan PDF periode "${periodLabel}" berhasil diunduh.`);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error('Gagal membuat laporan PDF.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white border border-gray-200 shadow-xl rounded-2xl">
        {/* Header */}
        <div className="bg-zinc-900 text-white p-5 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                <FileDown size={18} className="text-white" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white">
                  Tarik Laporan Kinerja Digital (PDF)
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                  Sesuaikan rentang tanggal laporan performa calon pembeli & jam sibuk
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Pilihan Opsi Periode */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2.5">
              Pilih Periode Laporan
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPeriod('this_month')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                  period === 'this_month'
                    ? 'bg-red-50 border-red-600 text-red-700 shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Bulan Ini
              </button>

              <button
                type="button"
                onClick={() => setPeriod('last_7_days')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                  period === 'last_7_days'
                    ? 'bg-red-50 border-red-600 text-red-700 shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                7 Hari Terakhir
              </button>

              <button
                type="button"
                onClick={() => setPeriod('last_30_days')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                  period === 'last_30_days'
                    ? 'bg-red-50 border-red-600 text-red-700 shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                30 Hari Terakhir
              </button>

              <button
                type="button"
                onClick={() => setPeriod('all_time')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                  period === 'all_time'
                    ? 'bg-red-50 border-red-600 text-red-700 shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Semua Waktu
              </button>
            </div>

            {/* Tombol Opsi Kustom */}
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => setPeriod('custom')}
                className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  period === 'custom'
                    ? 'bg-red-50 border-red-600 text-red-700 shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Calendar size={14} />
                <span>Pilih Rentang Tanggal Bebas (Kustom / Event Khusus)</span>
              </button>
            </div>

            {/* Form Input Tanggal Jika Kustom */}
            {period === 'custom' && (
              <div className="mt-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3 animate-in fade-in-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Dari Tanggal:
                    </label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Sampai Tanggal:
                    </label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ringkasan Cuplikan Data Sebelum Unduh */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Cuplikan Data yang Akan Masuk PDF:
              </span>
              <span className="text-xs font-bold text-red-600 bg-red-100/70 px-2 py-0.5 rounded">
                {periodLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100">
                <Users size={14} className="text-gray-400" />
                <div>
                  <span className="text-gray-500 text-[10px] block">Prospek Masuk</span>
                  <strong className="text-gray-900 font-bold">{filteredStats.totalLeads} Calon Pembeli</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100">
                <MousePointerClick size={14} className="text-gray-400" />
                <div>
                  <span className="text-gray-500 text-[10px] block">Klik Tombol WA</span>
                  <strong className="text-gray-900 font-bold">{filteredStats.totalClicks} Interaksi</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100">
                <Clock size={14} className="text-gray-400" />
                <div>
                  <span className="text-gray-500 text-[10px] block">Jam Paling Ramai</span>
                  <strong className="text-gray-900 font-bold text-[11px] truncate block max-w-[130px]" title={filteredStats.peakHoursText}>
                    {filteredStats.peakHoursText}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100">
                <Car size={14} className="text-gray-400" />
                <div>
                  <span className="text-gray-500 text-[10px] block">Model Terfavorit</span>
                  <strong className="text-gray-900 font-bold text-[11px] truncate block max-w-[130px]" title={filteredStats.topCarName}>
                    {filteredStats.topCarName}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <FileDown size={15} />
            <span>Unduh Laporan PDF Sekarang</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

