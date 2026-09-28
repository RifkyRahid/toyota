import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Agung Toyota Batam – Sales Representatif Resmi',
    template: '%s | Agung Toyota Batam',
  },
  description:
    'Dapatkan penawaran terbaik Toyota di Batam. Harga OTR Batam terbaru, promo kredit, dan konsultasi langsung dengan sales resmi.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
