'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  salesWhatsapp: string;
  logoUrl: string;
}

const navLinks = [
  { label: 'Beranda', href: '/' },
  { label: 'Katalog', href: '/katalog' },
  { label: 'Daftar Harga', href: '/daftar-harga' },
  { label: 'Promo', href: '/promo' },
  { label: 'Tentang Sales', href: '/tentang' },
];

export default function Navbar({ salesWhatsapp, logoUrl }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes (clicking a link)
  const handleLinkClick = () => setMenuOpen(false);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'backdrop-blur-md bg-white/90 shadow-sm border-b border-zinc-100'
          : 'bg-white',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 transition-all duration-300">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0" onClick={handleLinkClick}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-11 sm:h-12 md:h-16 w-auto object-contain transition-all"
              />
            ) : (
              <span className="text-xl font-bold text-zinc-900 tracking-tight">
                Agung Toyota
              </span>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Navigasi utama">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-zinc-700 rounded-md hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <a
              href={`https://wa.me/${salesWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md transition-colors shadow-sm"
            >
              Hubungi Sales
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-zinc-700 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white shadow-md">
          <nav className="flex flex-col px-4 py-3 gap-1" aria-label="Navigasi mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className="block px-3 py-2.5 text-sm font-medium text-zinc-700 rounded-md hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={`https://wa.me/${salesWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md transition-colors"
            >
              Hubungi Sales
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
