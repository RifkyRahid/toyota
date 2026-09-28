import { ReactNode } from 'react';
import { getSession } from '@/lib/auth';
import Sidebar from '@/components/admin/Sidebar';
import InactivityListener from '@/components/admin/InactivityListener';
import { Toaster } from 'sonner';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  // If unauthenticated (e.g. on /admin/login), don't render sidebar
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        {children}
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={session} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-sm font-semibold text-gray-800">
              Panel Pengelolaan Agung Toyota Batam
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Sesi Aktif (Maks 60m)
            </span>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <InactivityListener />
      <Toaster richColors position="top-right" />
    </div>
  );
}
