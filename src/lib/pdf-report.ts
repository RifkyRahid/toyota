import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TopCarItem {
  name: string;
  category: string;
  startingPrice: string;
  leadCount: number;
}

interface LeadReportItem {
  createdAt: string;
  name: string;
  whatsapp: string;
  carInterest?: string | null;
  status: string;
}

interface GenerateReportOptions {
  totalLeads: number;
  newLeads: number;
  dealLeads: number;
  topCars: TopCarItem[];
  recentLeads: LeadReportItem[];
}

export function generatePerformancePdf(options: GenerateReportOptions): void {
  const doc = new jsPDF('p', 'pt', 'a4');

  // Colors
  const toyotaRed = [235, 10, 30] as [number, number, number];
  const darkGray = [24, 24, 27] as [number, number, number];

  // 1. Header & Kop Surat
  doc.setFillColor(...toyotaRed);
  doc.rect(0, 0, 595.28, 12, 'F'); // Top accent line

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...darkGray);
  doc.text('AGUNG TOYOTA BATAM', 40, 50);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(110, 110, 115);
  doc.text('Official Sales Representative & Lead Generation System', 40, 65);
  doc.text('Jl. Yos Sudarso, Batu Ampar, Kota Batam, Kepulauan Riau', 40, 78);

  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Tanggal Cetak: ${today}`, 420, 50);

  doc.setDrawColor(220, 220, 225);
  doc.setLineWidth(1);
  doc.line(40, 95, 555, 95);

  // 2. Judul Dokumen
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...darkGray);
  doc.text('RINGKASAN LAPORAN KINERJA DIGITAL BULAN INI', 40, 120);

  // 3. KPI Metrics Summary Box
  autoTable(doc, {
    startY: 135,
    margin: { left: 40, right: 40 },
    theme: 'grid',
    head: [['Total Seluruh Prospek', 'Prospek Baru (Follow-up)', 'Prospek Deal Penjualan']],
    body: [
      [
        `${options.totalLeads} Calon Pembeli`,
        `${options.newLeads} Prospek`,
        `${options.dealLeads} Unit Terjual`,
      ],
    ],
    headStyles: {
      fillColor: darkGray,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      halign: 'center',
      fontSize: 11,
      fontStyle: 'bold',
      textColor: toyotaRed,
    },
  });

  // 4. Tabel 10 Unit Paling Diminati
  const lastY1 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...darkGray);
  doc.text('1. DAFTAR UNIT PALING BANYAK DIMINATI (TOP PROSPEK)', 40, lastY1 + 30);

  const topCarsRows = options.topCars.map((car, idx) => [
    `#${idx + 1}`,
    car.name,
    car.category,
    car.startingPrice ? `Rp ${Number(car.startingPrice).toLocaleString('id-ID')}` : '-',
    `${car.leadCount} Permintaan`,
  ]);

  autoTable(doc, {
    startY: lastY1 + 40,
    margin: { left: 40, right: 40 },
    theme: 'striped',
    head: [['No', 'Model Kendaraan', 'Kategori', 'Harga Mulai OTR', 'Peminat']],
    body: topCarsRows.length > 0 ? topCarsRows : [['-', 'Belum ada data', '-', '-', '-']],
    headStyles: {
      fillColor: toyotaRed,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
    },
  });

  // 5. Tabel Prospek Terkini
  const lastY2 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...darkGray);
  doc.text('2. REKAPITULASI PROSPEK TERBARU (LEAD PIPELINE)', 40, lastY2 + 30);

  const recentRows = options.recentLeads.map((lead) => [
    new Date(lead.createdAt).toLocaleDateString('id-ID'),
    lead.name,
    lead.whatsapp,
    lead.carInterest || 'Umum / Pricelist',
    lead.status,
  ]);

  autoTable(doc, {
    startY: lastY2 + 40,
    margin: { left: 40, right: 40 },
    theme: 'striped',
    head: [['Tanggal', 'Nama Calon Pembeli', 'No. WhatsApp', 'Unit Diminati', 'Status']],
    body: recentRows.length > 0 ? recentRows : [['-', 'Belum ada prospek', '-', '-', '-']],
    headStyles: {
      fillColor: darkGray,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8.5,
    },
  });

  // Footer / Dev Credit & Tanda Tangan
  const lastY3 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  const footerY = Math.min(lastY3 + 35, 780);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Dokumen ini dibuat otomatis oleh Sistem Digital Agung Toyota Batam untuk keperluan internal sales & manajerial.', 40, footerY);

  // Save document
  doc.save(`Laporan-Performa-Agung-Toyota-Batam-${Date.now()}.pdf`);
}
