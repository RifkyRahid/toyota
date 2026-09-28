'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Car,
  Layers,
  Users,
  Image as ImageIcon,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

const NAV_ITEMS = [
  { label: 'Dasbor', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Katalog Unit', href: '/admin/katalog', icon: Car },
  { label: 'Bulk Price', href: '/admin/bulk-price', icon: Layers },
  { label: 'Prospek Leads', href: '/admin/leads', icon: Users },
  { label: 'Hero Banner', href: '/admin/banner', icon: ImageIcon },
  { label: 'Blog & Promo', href: '/admin/blog', icon: FileText },
  { label: 'Pengaturan Diler', href: '/admin/settings', icon: Settings },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast.success('Berhasil logout.');
        router.push('/admin/login');
        router.refresh();
      }
    } catch (err) {
      toast.error('Gagal logout.');
      console.error(err);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-sm">
              T
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm tracking-tight block">
                Agung Toyota
              </span>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block">
                CMS Batam
              </span>
            </div>
          </div>
          <Link
            href="/"
            target="_blank"
            title="Lihat Website Publik"
            className="text-gray-400 hover:text-red-600 transition-colors p-1"
          >
            <ExternalLink size={16} />
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-1" aria-label="Navigasi Admin">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-red-50 text-red-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium'
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-red-600' : 'text-gray-400'}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-gray-700 text-xs">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">
              {user?.name || 'Administrator'}
            </p>
            <p className="text-[11px] text-gray-400 truncate">
              {user?.role || 'SUPERADMIN'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </aside>
  );
}
