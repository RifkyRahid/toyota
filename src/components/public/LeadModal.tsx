'use client';

import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { buildWaUrl } from '@/lib/format';
import { trackDownloadPricelist, trackClickToWa } from '@/lib/analytics';

interface LeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pricelistPdfUrl: string;
  salesWhatsapp: string;
}

type Step = 'form' | 'success';

export default function LeadModal({
  open,
  onOpenChange,
  pricelistPdfUrl,
  salesWhatsapp,
}: LeadModalProps) {
  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setStep('form');
    setName('');
    setWhatsapp('');
    setError(null);
    setLoading(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          whatsapp,
          sourcePage: '/daftar-harga',
          carInterest: 'Pricelist',
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'Terjadi kesalahan. Coba lagi.');
      }

      // Trigger download and track
      trackDownloadPricelist({ name, whatsapp });
      window.open(pricelistPdfUrl, '_blank');
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const waSuccessMessage = `Halo, saya ${name}, baru saja mengunduh lembar Pricelist OTR Batam. Saya ingin konsultasi lebih lanjut.`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Download Pricelist OTR Batam 2026
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Isi data berikut untuk mengunduh daftar harga OTR Batam terbaru
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
              {/* Nama */}
              <div>
                <label htmlFor="lead-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap <span className="text-red-600">*</span>
                </label>
                <input
                  id="lead-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                />
              </div>

              {/* No. WhatsApp */}
              <div>
                <label htmlFor="lead-wa" className="block text-sm font-medium text-gray-700 mb-1">
                  No. WhatsApp <span className="text-red-600">*</span>
                </label>
                <input
                  id="lead-wa"
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="08xx..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Download Sekarang'
                )}
              </button>
            </form>
          </>
        ) : (
          /* Success Step */
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Pricelist Sedang Diunduh!
              </h3>
              <p className="text-gray-500 text-sm">
                Terima kasih <span className="font-semibold text-gray-700">{name}</span>!{' '}
                File sedang terbuka di tab baru.
              </p>
            </div>
            <a
              href={buildWaUrl(salesWhatsapp, waSuccessMessage)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClickToWa({ source_button: 'lead_gate_success' })}
              className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg text-base transition-colors"
            >
              Lanjut Chat dengan Sales di WhatsApp
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
