'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  UserCheck,
  KeyRound,
  Trash2,
  Plus,
  X,
  Lock,
  User as UserIcon,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface UsersClientProps {
  initialUsers: UserItem[];
  currentUserId: string;
}

export default function UsersClient({ initialUsers, currentUserId }: UsersClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>(initialUsers);

  // Modal Tambah User
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState<'ADMIN' | 'SUPERADMIN'>('ADMIN');
  const [adding, setAdding] = useState(false);

  // Modal Reset Password
  const [resetTarget, setResetTarget] = useState<UserItem | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Action Hapus User
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    toast.success('Email disalin ke clipboard');
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addName.trim() || !addEmail.trim() || !addPassword) {
      toast.error('Semua kolom wajib diisi.');
      return;
    }

    if (addPassword.length < 8) {
      toast.error('Password minimal 8 karakter.');
      return;
    }

    setAdding(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addName.trim(),
          email: addEmail.trim(),
          password: addPassword,
          role: addRole,
        }),
      });

      let data: (UserItem & { error?: string }) = {} as UserItem;
      try {
        data = await res.json();
      } catch {
        throw new Error(
          `Gagal menghubungi API (Status: ${res.status}). Pastikan folder src/app/api/admin/ sudah di-upload ke VPS dan di-build.`
        );
      }

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menambahkan pengguna.');
      }

      setUsers((prev) => [...prev, data]);
      toast.success(`Akun "${data.name}" (${data.role}) berhasil dibuat.`);
      setShowAddModal(false);
      setAddName('');
      setAddEmail('');
      setAddPassword('');
      setAddRole('ADMIN');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;

    if (!resetNewPassword || resetNewPassword.length < 8) {
      toast.error('Password baru minimal 8 karakter.');
      return;
    }

    setResetting(true);
    try {
      const res = await fetch(`/api/admin/users/${resetTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword: resetNewPassword,
        }),
      });

      let data: { error?: string } = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(
          `Gagal menghubungi API (Status: ${res.status}). Pastikan file API users sudah terpasang di VPS.`
        );
      }

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mereset password.');
      }

      toast.success(`Password untuk "${resetTarget.name}" berhasil direset!`);
      setResetTarget(null);
      setResetNewPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mereset password.';
      toast.error(msg);
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteUser = async (user: UserItem) => {
    if (user.id === currentUserId) {
      toast.error('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus akun "${user.name}" (${user.email})?`)) {
      return;
    }

    setDeletingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      let data: { error?: string } = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(`Gagal menghubungi API (Status: ${res.status}).`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghapus pengguna.');
      }

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success(`Pengguna "${user.name}" berhasil dihapus.`);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus pengguna.';
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Kelola Pengguna CMS
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1">
              <ShieldCheck size={13} />
              Superadmin Only
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Kelola akun administrator untuk klien/sales, buat akun baru, dan reset password jika klien lupa kredensial.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* Tabel Pengguna */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3.5">
                  Pengguna
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Email Login
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Hak Akses (Role)
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Dibuat Pada
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const isCurrent = user.id === currentUserId;
                const isSuper = user.role === 'SUPERADMIN';

                return (
                  <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Nama & Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSuper
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 flex items-center gap-2">
                            <span>{user.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-gray-100 text-gray-600">
                                Anda
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 font-mono">
                            ID: {user.id.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-900 font-medium">
                        <span>{user.email}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(user.email)}
                          title="Salin Email"
                          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
                        >
                          {copiedEmail === user.email ? (
                            <Check size={14} className="text-green-600" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      {isSuper ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          <ShieldCheck size={13} />
                          SUPERADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <UserCheck size={13} />
                          ADMIN (KLIEN)
                        </span>
                      )}
                    </td>

                    {/* Dibuat */}
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Tombol Reset Password */}
                        <button
                          type="button"
                          onClick={() => {
                            setResetTarget(user);
                            setResetNewPassword('');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          title={`Reset password untuk ${user.name}`}
                        >
                          <KeyRound size={14} className="text-amber-600" />
                          <span>Reset Password</span>
                        </button>

                        {/* Tombol Hapus */}
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            disabled={deletingId === user.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Hapus Pengguna"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Pengguna Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <UserIcon size={18} className="text-red-600" />
                Tambah Pengguna Baru
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Contoh: Sales Batam / Rifky Dev"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Login
                </label>
                <input
                  type="email"
                  required
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Password Awal (Min. 8 Karakter)
                </label>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  placeholder="Password123!"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tingkat Hak Akses (Role)
                </label>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as 'ADMIN' | 'SUPERADMIN')}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="ADMIN">ADMIN — Pengelolaan Unit, Leads &amp; Konten (Cocok untuk Klien)</option>
                  <option value="SUPERADMIN">SUPERADMIN — Hak Akses Penuh + Manajemen User (Developer)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {adding ? 'Menyimpan...' : 'Buat Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password Pengguna */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Lock size={18} className="text-amber-600" />
                Reset Password Pengguna
              </h2>
              <button
                type="button"
                onClick={() => setResetTarget(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                Anda akan mereset password untuk akun:
                <div className="font-bold text-sm text-gray-900 mt-1">{resetTarget.name}</div>
                <div className="text-xs text-gray-600">{resetTarget.email}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Password Baru (Min. 8 Karakter)
                </label>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Ketik password baru untuk klien..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-1">
                  Setelah disimpan, Anda dapat langsung memberikan password ini kepada pengguna.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {resetting ? 'Menyimpan...' : 'Terapkan Password Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

