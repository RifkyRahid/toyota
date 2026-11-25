'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Check,
  Loader2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  DOMISILI_OPTIONS,
  normalizeIndonesianPhone,
  validateIndonesianWa,
  validateLeadName,
  type DomisiliOption,
} from '@/lib/lead-validation';
import { trackInternalCtaClick, trackSubmitWaLead } from '@/lib/analytics';

export interface OpenWaLeadGateParams {
  carInterest?: string;
  leadSource: string;
  ctaButtonType?: string;
  flyerId?: string;
}

interface WaLeadGateContextValue {
  openLeadGate: (params: OpenWaLeadGateParams) => void;
  closeLeadGate: () => void;
}

const WaLeadGateContext = createContext<WaLeadGateContextValue | null>(null);

export function useWaLeadGate(): WaLeadGateContextValue {
  const ctx = useContext(WaLeadGateContext);
  if (!ctx) {
    throw new Error('useWaLeadGate must be used within WaLeadGateProvider');
  }
  return ctx;
}

interface WaLeadGateProviderProps {
  children: ReactNode;
  salesWhatsapp: string;
  salesName?: string;
}

function getCleanSalesWa(raw: string): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits || digits === '6281234567890') {
    return '6285355746543';
  }
  return digits;
}

function recordFlyerWaClick(flyerId?: string) {
  if (!flyerId || flyerId.startsWith('default-') || flyerId.startsWith('fallback-')) {
    return;
  }
  try {
    const url = `/api/flyers/${flyerId}/track`;
    const payload = JSON.stringify({ action: 'WA_CLICK' });
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Abaikan error pelacakan flyer
  }
}

export function WaLeadGateProvider({
  children,
  salesWhatsapp,
}: WaLeadGateProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [gateContext, setGateContext] = useState<OpenWaLeadGateParams>({
    leadSource: 'general_wa',
    carInterest: 'Konsultasi Pembelian Toyota Batam',
  });

  // 4 Form Inputs + 1 Honeypot
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [domisili, setDomisili] = useState<DomisiliOption>('Batam');
  const [carInterest, setCarInterest] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const openLeadGate = useCallback((params: OpenWaLeadGateParams) => {
    const defaultInterest =
      params.carInterest?.trim() || 'Konsultasi Pembelian Toyota Batam';
    setGateContext(params);
    setCarInterest(defaultInterest);
    setError(null);
    setIsSubmitting(false);
    setHoneypot('');
    setIsOpen(true);
  }, []);

  const closeLeadGate = useCallback(() => {
    if (isSubmitting) return;
    setIsOpen(false);
    setError(null);
  }, [isSubmitting]);

  // Kunci scroll body & dengarkan tombol Escape saat modal terbuka
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 80);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLeadGate();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, closeLeadGate]);

  const handleWaChange = (value: string) => {
    // Hanya izinkan angka agar ramah keyboard numerik HP (jika paste +62 / spasi / strip otomatis dibersihkan)
    const normalized = normalizeIndonesianPhone(value);
    setWhatsapp(normalized.slice(0, 15));
  };

  const openWhatsAppUrl = (waUrl: string) => {
    const isMobile =
      typeof navigator !== 'undefined' &&
      /Android|iPhone|iPad|iPod|Mobile|Instagram|FBAN|FBAV|TikTok/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      window.location.assign(waUrl);
      return;
    }

    const opened = window.open(waUrl, '_blank', 'noopener,noreferrer');
    if (!opened) {
      window.location.assign(waUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    // 1. Cek honeypot (saring bot otomatis secara senyap)
    if (honeypot.trim() !== '') {
      setIsOpen(false);
      return;
    }

    // 2. Validasi client-side ketat
    const nameErr = validateLeadName(name);
    if (nameErr) {
      setError(nameErr);
      return;
    }

    const waCheck = validateIndonesianWa(whatsapp);
    if (!waCheck.valid) {
      setError(waCheck.error || 'Format nomor WhatsApp tidak valid.');
      return;
    }

    const finalInterest =
      carInterest.trim() || 'Konsultasi Pembelian Toyota Batam';
    const cleanName = name.trim();

    setError(null);
    setIsSubmitting(true);

    // 3. Pertahankan counter internal flyer & CTA click dashboard (non-blocking)
    if (gateContext.flyerId) {
      recordFlyerWaClick(gateContext.flyerId);
    }
    trackInternalCtaClick({
      buttonType: gateContext.ctaButtonType || gateContext.leadSource.toUpperCase(),
      carName: finalInterest,
      sourcePage:
        typeof window !== 'undefined' ? window.location.pathname : null,
    });

    // 4. Simpan ke PostgreSQL via POST /api/leads dengan timeout fallback 3.5 detik
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          name: cleanName,
          whatsapp: waCheck.cleaned,
          carInterest: finalInterest,
          domisili,
          leadSource: gateContext.leadSource,
          sourcePage:
            typeof window !== 'undefined' ? window.location.pathname : '/',
          website: honeypot,
        }),
      });

      clearTimeout(timeoutId);

      // Jika server menolak secara eksplisit karena validasi (400), tampilkan pesan error
      if (res.status === 400) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || 'Mohon periksa kembali nama dan nomor WhatsApp Anda.');
        setIsSubmitting(false);
        return;
      }
    } catch {
      clearTimeout(timeoutId);
      // Fallback: tetap lanjut redirect ke WhatsApp jika jaringan lambat / timeout agar calon pembeli tidak hilang
    }

    // 5. Push event konversi utama baru `submit_wa_lead` ke dataLayer & gtag
    trackSubmitWaLead({
      lead_source: gateContext.leadSource,
      car_interest: finalInterest,
      domisili,
    });

    // 6. Susun URL WhatsApp dengan pesan yang natural & ramah
    const cleanSalesWa = getCleanSalesWa(salesWhatsapp);
    const waMessage = `Halo Kak Lidya, saya ${cleanName} dari ${domisili}. Boleh minta info brosur & simulasi cicilan terbaru untuk ${finalInterest}?`;
    const waUrl = `https://wa.me/${cleanSalesWa}?text=${encodeURIComponent(
      waMessage
    )}`;

    setIsSubmitting(false);
    setIsOpen(false);
    openWhatsAppUrl(waUrl);
  };

  return (
    <WaLeadGateContext.Provider value={{ openLeadGate, closeLeadGate }}>
      {children}

      {isOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wa-lead-gate-title"
          onClick={closeLeadGate}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[92dvh] flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
          >
            {/* Header Modal dengan Tombol Close Besar & Aman dari Salah Pencet */}
            <div className="flex items-start justify-between gap-3 px-4 sm:px-5 py-3.5 bg-gradient-to-r from-red-700 via-red-600 to-zinc-900 text-white shrink-0">
              <div className="min-w-0 pr-2">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-100 mb-0.5">
                  <ShieldCheck size={13} className="shrink-0" />
                  <span>Sales Resmi Agung Toyota Batam</span>
                </div>
                <h2
                  id="wa-lead-gate-title"
                  className="text-base sm:text-lg font-extrabold leading-snug text-white"
                >
                  Konsultasi &amp; Info Promo via WhatsApp
                </h2>
              </div>

              <button
                type="button"
                onClick={closeLeadGate}
                disabled={isSubmitting}
                aria-label="Tutup formulir"
                className="w-11 h-11 -mr-1.5 -mt-1 rounded-full bg-black/25 hover:bg-black/45 active:scale-95 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Form (Scrollable di layar HP saat keyboard muncul) */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="p-4 sm:p-5 space-y-3.5 overflow-y-auto"
            >
              <p className="text-xs text-gray-500 leading-relaxed">
                Lengkapi data singkat di bawah ini agar Kak Lidya dapat langsung menyiapkan hitungan DP, cicilan, dan promo terbaik untuk Anda.
              </p>

              {/* Hidden Honeypot Field untuk menyaring bot otomatis */}
              <div
                className="absolute -left-[9999px] opacity-0 pointer-events-none h-0 overflow-hidden"
                aria-hidden="true"
              >
                <label htmlFor="lead-company-website">Website</label>
                <input
                  id="lead-company-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {/* 1. Nama Lengkap */}
              <div>
                <label
                  htmlFor="wa-gate-name"
                  className="block text-xs font-bold text-gray-800 mb-1"
                >
                  Nama Lengkap <span className="text-red-600">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  id="wa-gate-name"
                  type="text"
                  required
                  autoComplete="name"
                  maxLength={100}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
                />
              </div>

              {/* 2. Nomor WhatsApp */}
              <div>
                <label
                  htmlFor="wa-gate-phone"
                  className="block text-xs font-bold text-gray-800 mb-1"
                >
                  Nomor WhatsApp Aktif <span className="text-red-600">*</span>
                </label>
                <input
                  id="wa-gate-phone"
                  type="tel"
                  inputMode="numeric"
                  required
                  autoComplete="tel"
                  value={whatsapp}
                  onChange={(e) => {
                    handleWaChange(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Contoh: 085264112233"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition font-medium tracking-wide"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Hanya angka, minimal 10 digit (awalan 08... atau 628...)
                </p>
              </div>

              {/* 3. Domisili (Quick Toggle Buttons) */}
              <div>
                <span className="flex items-center gap-1 text-xs font-bold text-gray-800 mb-1.5">
                  <MapPin size={13} className="text-red-600" />
                  <span>Domisili Saat Ini</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {DOMISILI_OPTIONS.map((opt) => {
                    const active = domisili === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setDomisili(opt)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                          active
                            ? 'border-red-600 bg-red-50 text-red-700 ring-1 ring-red-600/30 shadow-2xs'
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {active && <Check size={14} className="text-red-600 shrink-0" />}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Unit / Promo Diminati */}
              <div>
                <label
                  htmlFor="wa-gate-interest"
                  className="block text-xs font-bold text-gray-800 mb-1"
                >
                  Unit / Promo Diminati
                </label>
                <input
                  id="wa-gate-interest"
                  type="text"
                  maxLength={100}
                  value={carInterest}
                  onChange={(e) => setCarInterest(e.target.value)}
                  placeholder="Contoh: Innova Zenix / Promo Tukar Tambah"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 focus:bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
                />
              </div>

              {/* Error Alert */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-semibold text-red-700"
                >
                  {error}
                </div>
              )}

              {/* Submit CTA Button */}
              <div className="pt-1 pb-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-green-600 hover:bg-green-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-green-600/25 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin shrink-0" />
                      <span>Menghubungkan ke WhatsApp...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle size={19} className="shrink-0" />
                      <span>Lanjut ke WhatsApp</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-gray-400 mt-2">
                  Data Anda aman &amp; hanya digunakan untuk layanan konsultasi resmi Toyota Batam.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </WaLeadGateContext.Provider>
  );
}
