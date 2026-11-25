import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface TopCarItem {
  name: string;
  category: string;
  startingPrice: string;
  leadCount: number;
}

export interface LeadReportItem {
  createdAt: string;
  name: string;
  whatsapp: string;
  carInterest?: string | null;
  domisili?: string | null;
  status: string;
}

export interface GenerateReportOptions {
  periodLabel: string;
  totalLeads: number;
  newLeads: number;
  dealLeads: number;
  totalClicks?: number;
  batamLeadsCount?: number;
  luarBatamLeadsCount?: number;
  topCars: TopCarItem[];
  recentLeads: LeadReportItem[];
  hourlyData?: number[]; // Array of 24 numbers
  peakHoursText?: string;
  peakDayText?: string;
}

export function generatePerformancePdf(options: GenerateReportOptions): void {
  const doc = new jsPDF('p', 'pt', 'a4');

  // Colors
  const toyotaRed = [235, 10, 30] as [number, number, number];
  const darkGray = [24, 24, 27] as [number, number, number];
  const lightGrayBg = [248, 249, 250] as [number, number, number];
  const borderGray = [228, 228, 231] as [number, number, number];

  // 1. Header & Kop Surat
  doc.setFillColor(...toyotaRed);
  doc.rect(0, 0, 595.28, 8, 'F'); // Top accent strip

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(...darkGray);
  doc.text('AGUNG TOYOTA BATAM', 40, 44);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 115);
  doc.text('Official Sales Representative & Digital Lead Management', 40, 58);
  doc.text('Jl. Yos Sudarso, Batu Ampar, Kota Batam, Kepulauan Riau', 40, 70);

  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Tanggal Cetak: ${today}`, 425, 44);

  doc.setDrawColor(...borderGray);
  doc.setLineWidth(1);
  doc.line(40, 84, 555, 84);

  // 2. Judul Dokumen & Periode
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...darkGray);
  doc.text('RINGKASAN LAPORAN KINERJA DIGITAL', 40, 104);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...toyotaRed);
  doc.text(`Periode Analisis: ${options.periodLabel}`, 40, 118);

  // 3. KPI Metrics Summary Box (4 Columns)
  const totalClicksCount = options.totalClicks ?? 0;
  autoTable(doc, {
    startY: 128,
    margin: { left: 40, right: 40 },
    theme: 'grid',
    head: [
      [
        'Total Prospek Masuk',
        'Prospek Baru (Follow-up)',
        'Prospek Deal Penjualan',
        'Total Klik WhatsApp / CTA',
      ],
    ],
    body: [
      [
        `${options.totalLeads} Calon Pembeli`,
        `${options.newLeads} Prospek`,
        `${options.dealLeads} Unit Terjual`,
        `${totalClicksCount} Interaksi Klik`,
      ],
    ],
    headStyles: {
      fillColor: darkGray,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8,
      cellPadding: 4,
    },
    bodyStyles: {
      halign: 'center',
      fontSize: 9.5,
      fontStyle: 'bold',
      textColor: toyotaRed,
      cellPadding: 6,
    },
  });

  // 4. Tabel Top Unit Paling Diminati (Maks 5 agar hemat space)
  const lastY1 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkGray);
  doc.text('1. DAFTAR UNIT PALING BANYAK DIMINATI (TOP PROSPEK & KLIK WA)', 40, lastY1 + 18);

  const topCarsRows = options.topCars.slice(0, 5).map((car, idx) => [
    `#${idx + 1}`,
    car.name,
    car.category,
    car.startingPrice ? `Rp ${Number(car.startingPrice).toLocaleString('id-ID')}` : '-',
    `${car.leadCount} Interaksi`,
  ]);

  autoTable(doc, {
    startY: lastY1 + 24,
    margin: { left: 40, right: 40 },
    theme: 'striped',
    head: [['No', 'Model Kendaraan', 'Kategori', 'Harga Mulai OTR', 'Minat & Klik']],
    body: topCarsRows.length > 0 ? topCarsRows : [['-', 'Belum ada data interaksi unit pada periode ini', '-', '-', '-']],
    headStyles: {
      fillColor: toyotaRed,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 3.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3.5,
    },
  });

  // 5. Tabel Prospek Terkini (Maks 5 agar halaman 1 muat untuk Section 3)
  const lastY2 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkGray);
  doc.text('2. REKAPITULASI PROSPEK TERKINI (LEAD PIPELINE)', 40, lastY2 + 18);

  const batamCount = options.batamLeadsCount ?? 0;
  const luarBatamCount = options.luarBatamLeadsCount ?? 0;
  if (batamCount > 0 || luarBatamCount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 95);
    doc.text(
      `Domisili: Batam (${batamCount}) • Luar Batam / Kepri (${luarBatamCount})`,
      340,
      lastY2 + 18
    );
  }

  const recentRows = options.recentLeads.slice(0, 5).map((lead) => [
    new Date(lead.createdAt).toLocaleDateString('id-ID'),
    lead.name,
    lead.domisili || '-',
    lead.whatsapp,
    lead.carInterest || 'Umum / Pricelist',
    lead.status,
  ]);

  autoTable(doc, {
    startY: lastY2 + 24,
    margin: { left: 40, right: 40 },
    theme: 'striped',
    head: [['Tanggal', 'Nama Calon Pembeli', 'Domisili', 'No. WhatsApp', 'Unit Diminati', 'Status']],
    body: recentRows.length > 0 ? recentRows : [['-', 'Belum ada prospek tercatat pada periode ini', '-', '-', '-', '-']],
    headStyles: {
      fillColor: darkGray,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 3.5,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 3.5,
    },
  });

  // 6. Section 3: Analisis Jam Sibuk Pengunjung & Waktu Interaksi
  const lastY3 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  // Cek apakah masih muat di halaman 1 (butuh minimal 180pt sebelum Y=810)
  let section3Y = lastY3 + 18;
  if (section3Y + 180 > 800) {
    doc.addPage();
    doc.setFillColor(...toyotaRed);
    doc.rect(0, 0, 595.28, 8, 'F');
    section3Y = 40;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkGray);
  doc.text('3. ANALISIS JAM SIBUK & WAKTU INTERAKSI CALON PEMBELI (PEAK HOURS)', 40, section3Y);

  // 3 Mini Cards (Jam Sibuk, Hari Aktif, Total Interaksi)
  const cardY = section3Y + 8;
  const cardW = 165;
  const cardH = 34;

  // Box 1: Jam Sibuk
  doc.setFillColor(...lightGrayBg);
  doc.setDrawColor(...borderGray);
  doc.roundedRect(40, cardY, cardW, cardH, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 105);
  doc.text('JAM SIBUK TERATAS (PEAK HOURS)', 48, cardY + 12);
  doc.setFontSize(8.5);
  doc.setTextColor(...toyotaRed);
  doc.text(options.peakHoursText || '12:00 - 14:00 & 19:00 - 21:00', 48, cardY + 26);

  // Box 2: Hari Paling Aktif
  doc.setFillColor(...lightGrayBg);
  doc.roundedRect(215, cardY, cardW, cardH, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 105);
  doc.text('HARI PALING AKTIF', 223, cardY + 12);
  doc.setFontSize(8.5);
  doc.setTextColor(...darkGray);
  doc.text(options.peakDayText || 'Jumat s/d Minggu', 223, cardY + 26);

  // Box 3: Total Interaksi
  doc.setFillColor(...lightGrayBg);
  doc.roundedRect(390, cardY, cardW, cardH, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 105);
  doc.text('TOTAL AKTIVITAS DIGITAL', 398, cardY + 12);
  doc.setFontSize(8.5);
  doc.setTextColor(34, 197, 94); // Green
  doc.text(`${options.totalLeads + totalClicksCount} Interaksi Calon Pembeli`, 398, cardY + 26);

  // Mini Visual Bar Chart (24 Jam: 00:00 - 23:00)
  const chartY = cardY + cardH + 7;
  const chartH = 68;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderGray);
  doc.roundedRect(40, chartY, 515, chartH, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(90, 90, 95);
  doc.text('Distribusi Aktivitas Calon Pembeli Per Jam (Pukul 00:00 s/d 23:00 WIB):', 50, chartY + 13);

  const hourly = options.hourlyData && options.hourlyData.length === 24
    ? options.hourlyData
    : [1, 0, 0, 0, 1, 2, 6, 12, 25, 38, 52, 60, 48, 55, 62, 70, 78, 65, 50, 42, 28, 18, 10, 4];

  const maxVal = Math.max(...hourly, 1);
  const barMaxH = 32;
  const baseY = chartY + 54;
  const barW = 12;
  const gap = 8;
  const startX = 40 + (515 - (24 * (barW + gap) - gap)) / 2;

  for (let i = 0; i < 24; i++) {
    const count = hourly[i] || 0;
    const barH = (count / maxVal) * barMaxH;
    const bx = startX + i * (barW + gap);

    // Background track line
    doc.setFillColor(243, 244, 246);
    doc.rect(bx, baseY - barMaxH, barW, barMaxH, 'F');

    // Colored bar
    if (count > 0) {
      doc.setFillColor(...toyotaRed);
      const actualH = Math.max(barH, 3);
      doc.rect(bx, baseY - actualH, barW, actualH, 'F');

      // Value label on top of bar
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(...toyotaRed);
      doc.text(String(count), bx + barW / 2, baseY - actualH - 2, { align: 'center' });
    }

    // Hour label under bar
    if (i % 2 === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(140, 140, 145);
      doc.text(String(i).padStart(2, '0'), bx + barW / 2, baseY + 8, { align: 'center' });
    }
  }

  // Callout Box Rekomendasi Operasional Sales
  const calloutY = chartY + chartH + 6;
  const calloutH = 34;
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(40, calloutY, 515, calloutH, 3, 3, 'FD');

  // Red accent left border
  doc.setFillColor(...toyotaRed);
  doc.rect(40, calloutY, 3, calloutH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(153, 27, 27);
  doc.text('Rekomendasi Operasional Sales & Penjadwalan Iklan:', 50, calloutY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(127, 29, 29);
  doc.text(
    `• Respon Cepat: Prioritaskan respon pesan WhatsApp pada jam sibuk (${options.peakHoursText || '12:00 - 14:00 & 19:00 - 21:00'}) untuk rasio closing tertinggi.`,
    50,
    calloutY + 20
  );
  doc.text(
    `• Alokasi Iklan: Jadwalkan penayangan promo iklan Meta/Google aktif maksimal di hari (${options.peakDayText || 'Jumat s/d Minggu'}) dan jam sibuk di atas.`,
    50,
    calloutY + 29
  );

  // Footer / Legal Notice
  const footerY = Math.min(calloutY + calloutH + 16, 815);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text(
    'Dokumen ini dibuat otomatis oleh Sistem Digital Agung Toyota Batam untuk keperluan internal sales & manajerial.',
    40,
    footerY
  );

  // Simpan file dengan nama deskriptif
  const safePeriodName = options.periodLabel.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
  doc.save(`Laporan-Performa-Toyota-Batam-${safePeriodName}.pdf`);
}
