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

interface AnalyticsChartProps {
  data?: number[]; // 24 numbers representing hour 00:00 to 23:00
}

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  // Gunakan data riil jika ada interaksi, atau fallback ke simulasi jika baru pertama kali dipasang
  const hasRealData = Boolean(data && data.some((count) => count > 0));
  const hoursData = hasRealData && data && data.length === 24 ? data : [
    2, 1, 0, 0, 1, 3, 8, 18, 35, 52, 68, 74, 55, 62, 70, 85, 92, 80, 65, 48, 32, 22, 12, 5
  ];

  const labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Aktivitas Pengunjung (Pengguna Aktif)',
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
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context: { raw: unknown }) => `${context.raw} Pengunjung`,
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
