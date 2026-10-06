'use client';

import { sendGAEvent } from '@next/third-parties/google';

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
    sendGAEvent('event', 'view_car_detail', {
      car_name: data.car_name,
      category: data.category,
      price_starting: String(data.price_starting),
    });
  } catch (err) {
    console.error('GA4 error:', err);
  }

  // Catat ke database internal
  try {
    const payload = JSON.stringify({
      buttonType: 'VIEW_CAR_DETAIL',
      carName: data.car_name,
      sourcePage: typeof window !== 'undefined' ? window.location.pathname : null,
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
 * Event 2: Klik WhatsApp (click_to_wa)
 * Trigger: Semua klik pada tombol / tautan WhatsApp.
 */
export function trackClickToWa(data: {
  source_button: string; // e.g. "KATALOG_CARD", "VARIAN_DETAIL", "FLOATING_WA", "NAVBAR", "PROMO_DETAIL", "SALES_SECTION", "MOBILE_BAR"
  car_name?: string;
  source_page?: string;
}) {
  // Kirim ke Google Analytics
  try {
    sendGAEvent('event', 'click_to_wa', {
      source_button: data.source_button,
      car_name: data.car_name || 'general',
    });
  } catch (err) {
    console.error('GA4 error:', err);
  }

  // Kirim ke Database Internal
  try {
    const payload = JSON.stringify({
      buttonType: data.source_button,
      carName: data.car_name || null,
      sourcePage: data.source_page || (typeof window !== 'undefined' ? window.location.pathname : null),
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
 * Event 3: Unduh Pricelist (download_pricelist)
 * Trigger: Saat form Lead Gate berhasil disubmit.
 */
export function trackDownloadPricelist(data: {
  name: string;
  whatsapp?: string;
}) {
  try {
    sendGAEvent('event', 'download_pricelist', {
      lead_name: data.name,
    });
  } catch (err) {
    console.error('GA4 error:', err);
  }
}

