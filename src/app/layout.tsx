import type { Metadata } from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: 'Agung Toyota Batam – Promo Toyota Batam, Harga OTR, Kredit & Sales Resmi',
    template: '%s | Agung Toyota Batam',
  },
    verification: {
      google: '<meta name="google-site-verification" content="DEoCAnBKUPpV7mX7ys1NdfDh0-r1GaDOMEi7gdwZagA" />',
    },
  description:
    'Dapatkan penawaran terbaik Toyota di Batam. Harga OTR Batam terbaru, promo kredit, dan konsultasi langsung dengan sales resmi.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-5BHBH3T7';
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="id" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <GoogleTagManager gtmId={gtmId} />
      <body suppressHydrationWarning>
        {children}
        {gaId && gaId !== 'G-T8KNGRYFEM' && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
