import type { Metadata } from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="id" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-XXXXXXXXXX"} />
      </body>
    </html>
  );
}
