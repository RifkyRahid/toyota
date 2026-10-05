/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aktifkan React Strict Mode untuk deteksi dini masalah di development
  reactStrictMode: true,

  images: {
    // Gambar sudah dikompresi dan dikonversi ke WebP oleh Sharp pada saat upload
    unoptimized: true,
    remotePatterns: [],
  },

  // Header keamanan HTTP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
