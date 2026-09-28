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
}

/**
 * Event 2: Klik WhatsApp (click_to_wa)
 * Trigger: Semua klik pada tombol / tautan WhatsApp.
 */
export function trackClickToWa(data: {
  source_button: string; // e.g. "floating", "car_detail", "lead_gate_success", "navbar"
  car_name?: string;
}) {
  try {
    sendGAEvent('event', 'click_to_wa', {
      source_button: data.source_button,
      car_name: data.car_name || 'general',
    });
  } catch (err) {
    console.error('GA4 error:', err);
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
