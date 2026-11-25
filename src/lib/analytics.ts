'use client';

import { sendGAEvent, sendGTMEvent } from '@next/third-parties/google';

/**
 * Helper internal: catat interaksi ke tabel cta_clicks di PostgreSQL
 * secara non-blocking menggunakan sendBeacon / fetch keepalive.
 */
export function trackInternalCtaClick(data: {
  buttonType: string;
  carName?: string | null;
  sourcePage?: string | null;
}) {
  try {
    const payload = JSON.stringify({
      buttonType: data.buttonType,
      carName: data.carName || null,
      sourcePage:
        data.sourcePage ||
        (typeof window !== 'undefined' ? window.location.pathname : null),
    });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/track', blob);
    } else if (typeof fetch !== 'undefined') {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (err) {
    console.error('Internal track error:', err);
  }
}

/**
 * Event 1: Melihat Detail Unit (view_car_detail)
 * Trigger: Saat halaman /mobil/[slug] dimuat.
 */
export function trackViewCarDetail(data: {
  car_name: string;
  category: string;
  price_starting: string | number;
}) {
  try {
    const eventPayload = {
      car_name: data.car_name,
      category: data.category,
      price_starting: String(data.price_starting),
    };
    sendGTMEvent({ event: 'view_car_detail', ...eventPayload });
    sendGAEvent('event', 'view_car_detail', eventPayload);
  } catch (err) {
    console.error('GTM/GA4 error:', err);
  }

  trackInternalCtaClick({
    buttonType: 'VIEW_CAR_DETAIL',
    carName: data.car_name,
  });
}

/**
 * Event 2: Klik WhatsApp Langsung (click_to_wa)
 * Trigger: Tombol WhatsApp non-Lead-Gate (misal langkah sukses LeadModal pricelist).
 */
export function trackClickToWa(data: {
  source_button: string;
  car_name?: string;
  source_page?: string;
}) {
  try {
    const eventPayload = {
      source_button: data.source_button,
      car_name: data.car_name || 'general',
    };
    sendGTMEvent({ event: 'click_to_wa', ...eventPayload });
    sendGAEvent('event', 'click_to_wa', eventPayload);
  } catch (err) {
    console.error('GTM/GA4 error:', err);
  }

  trackInternalCtaClick({
    buttonType: data.source_button,
    carName: data.car_name || null,
    sourcePage: data.source_page,
  });
}

/**
 * Event 3: Unduh Pricelist (download_pricelist)
 * Trigger: Saat form Lead Gate Pricelist berhasil disubmit.
 */
export function trackDownloadPricelist(data: {
  name: string;
  whatsapp?: string;
}) {
  try {
    sendGTMEvent({ event: 'download_pricelist', lead_name: data.name });
    sendGAEvent('event', 'download_pricelist', {
      lead_name: data.name,
    });
  } catch (err) {
    console.error('GTM/GA4 error:', err);
  }
}

/**
 * Event 4: Submit Lead Gate WhatsApp (submit_wa_lead)
 * Trigger: Saat mini-form Lead Gate lolos validasi dan disubmit sebelum redirect WA.
 * Hanya push ke window.dataLayer agar GTM menangani pengiriman ke GA4 & Google Ads secara terpusat (tanpa double-firing).
 */
export function trackSubmitWaLead(data: {
  lead_source: string;
  car_interest: string;
  domisili: string;
}) {
  const safeLeadSource =
    String(data.lead_source ?? '').trim() || 'general_wa';
  const safeCarInterest =
    String(data.car_interest ?? '').trim() || 'Konsultasi Pembelian Toyota Batam';
  const rawDomisili = String(data.domisili ?? '').trim();
  const normalizedDomisili = rawDomisili.toLowerCase().includes('luar')
    ? 'Luar Batam'
    : 'Batam';

  try {
    if (typeof window !== 'undefined') {
      const win = window as unknown as {
        dataLayer?: Array<Record<string, unknown>>;
      };

      win.dataLayer = win.dataLayer || [];
      win.dataLayer.push({
        event: 'submit_wa_lead',
        lead_source: safeLeadSource,
        car_interest: safeCarInterest,
        domisili: normalizedDomisili,
      });
    }
  } catch (err) {
    console.error('GTM submit_wa_lead error:', err);
  }
}
