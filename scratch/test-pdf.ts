import fs from 'fs';
import path from 'path';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Replicate generator logic to test in Node environment
function testGeneratePdf() {
  const doc = new jsPDF('p', 'pt', 'a4');
  const toyotaRed = [235, 10, 30] as [number, number, number];
  const darkGray = [24, 24, 27] as [number, number, number];
  const lightGrayBg = [248, 249, 250] as [number, number, number];
  const borderGray = [228, 228, 231] as [number, number, number];

  // 1. Header
  doc.setFillColor(...toyotaRed);
  doc.rect(0, 0, 595.28, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(...darkGray);
  doc.text('AGUNG TOYOTA BATAM', 40, 44);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 115);
  doc.text('Official Sales Representative & Digital Lead Management', 40, 58);
  doc.text('Jl. Yos Sudarso, Batu Ampar, Kota Batam, Kepulauan Riau', 40, 70);
  doc.text('Tanggal Cetak: 7 Oktober 2026', 425, 44);

  doc.setDrawColor(...borderGray);
  doc.setLineWidth(1);
  doc.line(40, 84, 555, 84);

  // 2. Title & Period
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...darkGray);
  doc.text('RINGKASAN LAPORAN KINERJA DIGITAL', 40, 104);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...toyotaRed);
  doc.text('Periode Analisis: 7 Hari Terakhir (1 Okt 2026 - 7 Okt 2026)', 40, 118);

  // 3. KPI Metrics
  autoTable(doc, {
    startY: 128,
    margin: { left: 40, right: 40 },
    theme: 'grid',
    head: [['Total Prospek Masuk', 'Prospek Baru (Follow-up)', 'Prospek Deal Penjualan', 'Total Klik WhatsApp / CTA']],
    body: [['12 Calon Pembeli', '5 Prospek', '2 Unit Terjual', '48 Interaksi Klik']],
    headStyles: { fillColor: darkGray, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', fontSize: 8, cellPadding: 4 },
    bodyStyles: { halign: 'center', fontSize: 9.5, fontStyle: 'bold', textColor: toyotaRed, cellPadding: 6 },
  });

  const lastY1 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  // 4. Section 1 Top Cars
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkGray);
  doc.text('1. DAFTAR UNIT PALING BANYAK DIMINATI (TOP PROSPEK & KLIK WA)', 40, lastY1 + 18);

  autoTable(doc, {
    startY: lastY1 + 24,
    margin: { left: 40, right: 40 },
    theme: 'striped',
    head: [['No', 'Model Kendaraan', 'Kategori', 'Harga Mulai OTR', 'Minat & Klik']],
    body: [
      ['#1', 'All New Kijang Innova Zenix', 'MPV', 'Rp 437.700.000', '18 Interaksi'],
      ['#2', 'All New Avanza', 'MPV', 'Rp 243.000.000', '14 Interaksi'],
      ['#3', 'All New Yaris Cross Hybrid', 'SUV', 'Rp 440.600.000', '9 Interaksi'],
      ['#4', 'All New Rush GR Sport', 'SUV', 'Rp 298.500.000', '5 Interaksi'],
      ['#5', 'New Calya', 'MPV', 'Rp 172.000.000', '2 Interaksi'],
    ],
    headStyles: { fillColor: toyotaRed, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8, cellPadding: 3.5 },
    styles: { fontSize: 8, cellPadding: 3.5 },
  });

  const lastY2 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  // 5. Section 2 Recent Leads
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkGray);
  doc.text('2. REKAPITULASI PROSPEK TERKINI (LEAD PIPELINE)', 40, lastY2 + 18);

  autoTable(doc, {
    startY: lastY2 + 24,
    margin: { left: 40, right: 40 },
    theme: 'striped',
    head: [['Tanggal', 'Nama Calon Pembeli', 'No. WhatsApp', 'Unit Diminati', 'Status']],
    body: [
      ['07/10/2026', 'Budi Santoso', '081270019283', 'Innova Zenix 2.0 V', 'BARU'],
      ['06/10/2026', 'Hendro Wijaya', '081364529182', 'Avanza 1.5 G CVT', 'PROSES_KREDIT'],
      ['05/10/2026', 'Siti Rahma', '085278192833', 'Yaris Cross HEV', 'DIHUBUNGI'],
      ['03/10/2026', 'David Tan', '08117728192', 'Rush GR Sport', 'DEAL'],
    ],
    headStyles: { fillColor: darkGray, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8, cellPadding: 3.5 },
    styles: { fontSize: 7.5, cellPadding: 3.5 },
  });

  const lastY3 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  const section3Y = lastY3 + 18;

  // 6. Section 3 Peak Hours & Analysis
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkGray);
  doc.text('3. ANALISIS JAM SIBUK & WAKTU INTERAKSI CALON PEMBELI (PEAK HOURS)', 40, section3Y);

  const cardY = section3Y + 8;
  const cardW = 165;
  const cardH = 34;

  doc.setFillColor(...lightGrayBg);
  doc.setDrawColor(...borderGray);
  doc.roundedRect(40, cardY, cardW, cardH, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 105);
  doc.text('JAM SIBUK TERATAS (PEAK HOURS)', 48, cardY + 12);
  doc.setFontSize(8.5);
  doc.setTextColor(...toyotaRed);
  doc.text('12:00 - 14:00 & 19:00 - 21:00', 48, cardY + 26);

  doc.setFillColor(...lightGrayBg);
  doc.roundedRect(215, cardY, cardW, cardH, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 105);
  doc.text('HARI PALING AKTIF', 223, cardY + 12);
  doc.setFontSize(8.5);
  doc.setTextColor(...darkGray);
  doc.text('Jumat s/d Minggu', 223, cardY + 26);

  doc.setFillColor(...lightGrayBg);
  doc.roundedRect(390, cardY, cardW, cardH, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 105);
  doc.text('TOTAL AKTIVITAS DIGITAL', 398, cardY + 12);
  doc.setFontSize(8.5);
  doc.setTextColor(34, 197, 94);
  doc.text('60 Interaksi Calon Pembeli', 398, cardY + 26);

  // Bar chart
  const chartY = cardY + cardH + 7;
  const chartH = 68;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderGray);
  doc.roundedRect(40, chartY, 515, chartH, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(90, 90, 95);
  doc.text('Distribusi Aktivitas Calon Pembeli Per Jam (Pukul 00:00 s/d 23:00 WIB):', 50, chartY + 13);

  const hourly = [0, 0, 0, 0, 0, 1, 2, 4, 7, 12, 18, 22, 16, 19, 21, 25, 28, 24, 18, 15, 10, 6, 3, 1];
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

    doc.setFillColor(243, 244, 246);
    doc.rect(bx, baseY - barMaxH, barW, barMaxH, 'F');

    if (count > 0) {
      doc.setFillColor(...toyotaRed);
      const actualH = Math.max(barH, 3);
      doc.rect(bx, baseY - actualH, barW, actualH, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(...toyotaRed);
      doc.text(String(count), bx + barW / 2, baseY - actualH - 2, { align: 'center' });
    }

    if (i % 2 === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(140, 140, 145);
      doc.text(String(i).padStart(2, '0'), bx + barW / 2, baseY + 8, { align: 'center' });
    }
  }

  // Callout Box
  const calloutY = chartY + chartH + 6;
  const calloutH = 34;
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(40, calloutY, 515, calloutH, 3, 3, 'FD');

  doc.setFillColor(...toyotaRed);
  doc.rect(40, calloutY, 3, calloutH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(153, 27, 27);
  doc.text('Rekomendasi Operasional Sales & Penjadwalan Iklan:', 50, calloutY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(127, 29, 29);
  doc.text('• Respon Cepat: Prioritaskan respon pesan WhatsApp pada jam sibuk (12:00 - 14:00 & 19:00 - 21:00) untuk rasio closing tertinggi.', 50, calloutY + 20);
  doc.text('• Alokasi Iklan: Jadwalkan penayangan promo iklan Meta/Google aktif maksimal di hari (Jumat s/d Minggu) dan jam sibuk di atas.', 50, calloutY + 29);

  // Footer
  const footerY = Math.min(calloutY + calloutH + 16, 815);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text('Dokumen ini dibuat otomatis oleh Sistem Digital Agung Toyota Batam untuk keperluan internal sales & manajerial.', 40, footerY);

  const outDir = path.resolve('scratch');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outPath = path.join(outDir, 'sample-laporan-performa.pdf');
  const buffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outPath, buffer);
  console.log('PDF created successfully at:', outPath, 'Bytes:', buffer.length);
}

testGeneratePdf();

