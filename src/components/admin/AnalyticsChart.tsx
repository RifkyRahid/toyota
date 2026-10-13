'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export interface HourlyMeta {
  hour: number;
  count: number;
  dateLabel?: string;
  periodLabel?: string;
  clicksCount?: number;
  leadsCount?: number;
  topCars?: string[];
  dateBreakdown?: Array<{ dateStr: string; dayName: string; count: number }>;
}

interface AnalyticsChartProps {
  data?: number[]; // 24 numbers representing hour 00:00 to 23:00
  hourlyMeta?: HourlyMeta[];
  filterType?: 'today' | '7d' | '30d' | 'all';
}

export default function AnalyticsChart({
  data,
  hourlyMeta,
  filterType = 'all',
}: AnalyticsChartProps) {
  // Tampilkan data 0 murni jika filter adalah hari ini, atau fallback baseline jika instalasi awal kosong di 'all'
  const hoursData = data && data.length === 24
    ? data
    : filterType === 'today'
    ? Array(24).fill(0)
    : [2, 1, 0, 0, 1, 3, 8, 18, 35, 52, 68, 74, 55, 62, 70, 85, 92, 80, 65, 48, 32, 22, 12, 5];

  const labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Aktivitas Pengunjung',
        data: hoursData,
        backgroundColor: 'rgba(235, 10, 30, 0.75)', // Toyota Red with opacity
        hoverBackgroundColor: '#EB0A1E',
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#18181b',
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 11 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (tooltipItems: Array<{ dataIndex: number }>) => {
            const item = tooltipItems[0];
            const hour = item.dataIndex;
            const meta = hourlyMeta?.[hour];
            const hourRange = `Pukul ${String(hour).padStart(2, '0')}:00 - ${String(hour).padStart(2, '0')}:59 WIB`;

            if (filterType === 'today') {
              const dateText = meta?.dateLabel || new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });
              return `📅 ${dateText}\n⏰ ${hourRange}`;
            }

            const period = meta?.periodLabel || (
              filterType === '7d' ? '7 Hari Terakhir' : filterType === '30d' ? '30 Hari Terakhir' : 'Semua Waktu'
            );
            return `⏰ ${hourRange}\n📅 Periode: ${period}`;
          },
          label: (context: { raw: unknown }) => {
            const count = context.raw as number;
            return `📊 Total Interaksi: ${count}`;
          },
          afterBody: (tooltipItems: Array<{ dataIndex: number }>) => {
            const item = tooltipItems[0];
            const hour = item.dataIndex;
            const meta = hourlyMeta?.[hour];
            if (!meta || meta.count === 0) {
              return ['\n(Belum ada interaksi tercatat pada jam ini)'];
            }

            const lines: string[] = [];

            // Breakdown Clicks vs Leads
            const parts: string[] = [];
            if (meta.clicksCount !== undefined && meta.clicksCount > 0) {
              parts.push(`Klik WA: ${meta.clicksCount}`);
            }
            if (meta.leadsCount !== undefined && meta.leadsCount > 0) {
              parts.push(`Prospek Form: ${meta.leadsCount}`);
            }
            if (parts.length > 0) {
              lines.push('');
              lines.push(`• Rincian: ${parts.join(' | ')}`);
            }

            // Breakdown per tanggal (untuk filter rentang hari selain 'today')
            if (filterType !== 'today' && meta.dateBreakdown && meta.dateBreakdown.length > 0) {
              lines.push('');
              lines.push('• Hari & Tanggal Terjadinya:');
              meta.dateBreakdown.slice(0, 3).forEach((d) => {
                lines.push(`   - ${d.dayName}, ${d.dateStr} (${d.count}x)`);
              });
              if (meta.dateBreakdown.length > 3) {
                lines.push(`   ...+${meta.dateBreakdown.length - 3} tanggal lainnya`);
              }
            }

            // Top Cars yang diklik
            if (meta.topCars && meta.topCars.length > 0) {
              lines.push('');
              lines.push(`• Unit Minat: ${meta.topCars.join(', ')}`);
            }

            return lines;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 10 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          font: { size: 10 },
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="w-full h-64 md:h-72">
      <Bar data={chartData} options={options} />
    </div>
  );
}
