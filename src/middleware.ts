import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  // ── 1. Proteksi Halaman /admin/* ──────────────────────────────
  if (pathname.startsWith('/admin')) {
    // Biarkan /admin (tanpa sub-path) menampilkan halaman 404 agar pintu login tidak langsung terekspos
    if (pathname === '/admin') {
      return NextResponse.next();
    }

    const sessionToken = request.cookies.get(COOKIE_NAME)?.value;
    const session = sessionToken ? await verifySessionToken(sessionToken) : null;

    // Jika membuka /admin/login saat sudah login, arahkan ke /admin/dashboard
    if (pathname === '/admin/login') {
      if (session) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // Jika mengakses rute /admin/* tanpa sesi valid, arahkan ke /admin/login
    if (!session) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl, 307);
    }

    return NextResponse.next();
  }

  // ── 2. Proteksi Endpoint API (/api/*) ─────────────────────────
  if (pathname.startsWith('/api')) {
    // Daftar endpoint publik yang memang boleh diakses pengunjung tanpa login:
    // - POST /api/auth/login & POST /api/auth/logout
    // - POST /api/leads (form unduh pricelist pengunjung)
    // - POST /api/analytics/track (pelacakan klik tombol WA)
    // - POST /api/flyers/[id]/track (pelacakan klik flyer; aksi RESET tetap dicek di dalam route)
    // - GET pada katalog mobil, banner, flyer, testimoni, blog, settings
    const isPublicAuth =
      pathname === '/api/auth/login' || pathname === '/api/auth/logout';
    const isPublicLeadSubmit = pathname === '/api/leads' && method === 'POST';
    const isPublicAnalyticsTrack =
      pathname === '/api/analytics/track' && method === 'POST';
    const isPublicFlyerTrack =
      /^\/api\/flyers\/[^/]+\/track$/.test(pathname) && method === 'POST';
    const isPublicRead =
      method === 'GET' &&
      (pathname.startsWith('/api/cars') ||
        pathname.startsWith('/api/banners') ||
        pathname.startsWith('/api/flyers') ||
        pathname.startsWith('/api/testimonials') ||
        pathname.startsWith('/api/blogs') ||
        pathname.startsWith('/api/settings'));

    if (
      isPublicAuth ||
      isPublicLeadSubmit ||
      isPublicAnalyticsTrack ||
      isPublicFlyerTrack ||
      isPublicRead
    ) {
      return NextResponse.next();
    }

    // Seluruh endpoint /api lainnya (termasuk POST/PUT/PATCH/DELETE data & GET /api/leads) WAJIB sesi Admin
    const sessionToken = request.cookies.get(COOKIE_NAME)?.value;
    const session = sessionToken ? await verifySessionToken(sessionToken) : null;

    if (!session) {
      return NextResponse.json(
        { error: 'Akses ditolak. Sesi admin tidak valid atau telah berakhir.' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};

