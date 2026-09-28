'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60 minutes
const WARNING_TIMEOUT = 55 * 60 * 1000;    // 55 minutes (warn 5 mins before logout)

export default function InactivityListener() {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    toast.error('Sesi Anda telah berakhir karena tidak ada aktivitas selama 60 menit.');
    router.push('/admin/login?reason=inactivity');
  }, [router]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

    // Warning 5 minutes before auto-logout
    warningTimerRef.current = setTimeout(() => {
      toast.warning('Sesi Anda akan berakhir dalam 5 menit karena tidak ada aktivitas.', {
        duration: 10000,
      });
    }, WARNING_TIMEOUT);

    // Auto-logout at 60 minutes
    timerRef.current = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_TIMEOUT);
  }, [handleLogout]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];

    // Start timer on mount
    resetTimer();

    // Attach listeners
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((evt) => window.addEventListener(evt, handleActivity));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
    };
  }, [resetTimer]);

  return null;
}
