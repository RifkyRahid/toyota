'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import {
  Download,
  Search,
  MessageSquare,
  PhoneCall,
  Check,
  Trash2,
  EyeOff,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { extractDomisili } from '@/lib/lead-validation';

export interface LeadItem {
  id: string;
  name: string;
  whatsapp: string;
  sourcePage?: string | null;
  carInterest?: string | null;
  status: 'BARU' | 'DIHUBUNGI' | 'PROSES_KREDIT' | 'DEAL' | 'BATAL';
  notes?: string | null;
  createdAt: string;
}

interface LeadsClientProps {
  initialLeads: LeadItem[];
}

const STATUS_OPTIONS = [
  'BARU',
  'DIHUBUNGI',
  'PROSES_KREDIT',
  'DEAL',
  'BATAL',
] as const;

export default function LeadsClient({ initialLeads }: LeadsClientProps) {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('SEMUA');
  const [hideCancelled, setHideCancelled] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Selection & Delete states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[] | null>(null);
  const [deleteLabel, setDeleteLabel] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.whatsapp.includes(search) ||
        (lead.carInterest &&
          lead.carInterest.toLowerCase().includes(search.toLowerCase())) ||
        (lead.notes && lead.notes.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === 'SEMUA' || lead.status === statusFilter;

      const matchesHidden =
        !hideCancelled || statusFilter === 'BATAL' || lead.status !== 'BATAL';

      return matchesSearch && matchesStatus && matchesHidden;
    });
  }, [leads, search, statusFilter, hideCancelled]);

  const visibleIds = useMemo(
    () => filteredLeads.map((l) => l.id),
    [filteredLeads]
  );

  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Export to Excel function using xlsx
  const handleExportExcel = () => {
    try {
      const dataToExport = filteredLeads.map((l, index) => ({
        No: index + 1,
        'Tanggal Masuk': new Date(l.createdAt).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        'Nama Calon Pembeli': l.name,
        'Nomor WhatsApp': l.whatsapp,
        Domisili: extractDomisili(l.notes) || '-',
        'Unit Minat': l.carInterest || 'Umum / Pricelist',
        'Sumber Halaman': l.sourcePage,
        'Status Prospek': l.status,
        'Catatan Sales': l.notes || '-',
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Prospek');

      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(
        workbook,
        `Data-Prospek-Agung-Toyota-Batam-${dateStr}.xlsx`
      );
      toast.success('File Excel berhasil diekspor.');
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengekspor file Excel.');
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setUpdatingId(leadId);
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });

      if (!res.ok) throw new Error('Gagal memperbarui status prospek.');

      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, status: newStatus as LeadItem['status'] } : l
        )
      );
      toast.success('Status prospek berhasil diperbarui.');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async (leadId: string) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, notes: noteText }),
      });

      if (!res.ok) throw new Error('Gagal memperbarui catatan.');

      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, notes: noteText } : l))
      );
      setEditingNotesId(null);
      toast.success('Catatan berhasil disimpan.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    }
  };

  const promptSingleDelete = (lead: LeadItem) => {
    setDeleteTargetIds([lead.id]);
    setDeleteLabel(`prospek atas nama "${lead.name}" (${lead.whatsapp})`);
  };

  const promptBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteTargetIds(selectedIds);
    setDeleteLabel(`${selectedIds.length} data prospek terpilih`);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetIds || deleteTargetIds.length === 0) return;
    setIsDeleting(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          deleteTargetIds.length === 1
            ? { id: deleteTargetIds[0] }
            : { ids: deleteTargetIds }
        ),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || 'Gagal menghapus data prospek.');
      }

      const idSet = new Set(deleteTargetIds);
      setLeads((prev) => prev.filter((l) => !idSet.has(l.id)));
      setSelectedIds((prev) => prev.filter((id) => !idSet.has(id)));
      setDeleteTargetIds(null);
      toast.success(`${deleteTargetIds.length} data prospek berhasil dihapus.`);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus data.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: LeadItem['status']) => {
    switch (status) {
      case 'BARU':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'DIHUBUNGI':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PROSES_KREDIT':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DEAL':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'BATAL':
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Data Prospek &amp; Leads Calon Pembeli
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola prospek masuk, ubah status, sembunyikan status BATAL, atau hapus data hasil testing.
          </p>
        </div>

        {/* Green Export Excel Button */}
        <button
          type="button"
          onClick={handleExportExcel}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer self-start"
        >
          <Download size={17} />
          <span>Export to Excel (.xlsx)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative flex items-center">
            <Search size={18} className="absolute left-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, WhatsApp, unit mobil, atau catatan..."
              className="w-full pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-medium"
            >
              <option value="SEMUA">Semua Status ({leads.length})</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hideCancelled}
              onChange={(e) => setHideCancelled(e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <EyeOff size={14} className="text-gray-400" />
            <span>Sembunyikan prospek berstatus BATAL</span>
          </label>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-gray-700">
                {selectedIds.length} dipilih
              </span>
              <button
                type="button"
                onClick={promptBulkDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Hapus Terpilih ({selectedIds.length})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    aria-label="Pilih semua prospek yang tampil"
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Calon Pembeli</th>
                <th className="py-3.5 px-4">Kontak WhatsApp</th>
                <th className="py-3.5 px-4">Minat Unit</th>
                <th className="py-3.5 px-4">Status Pipeline</th>
                <th className="py-3.5 px-4">Catatan Sales</th>
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.map((lead) => {
                const waClean = lead.whatsapp.replace(/\D/g, '');
                const waUrl = `https://wa.me/${waClean}?text=${encodeURIComponent(
                  `Halo Bapak/Ibu ${lead.name}, saya dari Agung Toyota Batam menindaklanjuti permintaan informasi unit Toyota.`
                )}`;
                const domisiliLabel = extractDomisili(lead.notes);
                const isSelected = selectedIds.includes(lead.id);

                return (
                  <tr
                    key={lead.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-red-50/40' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(lead.id)}
                        aria-label={`Pilih ${lead.name}`}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-900 block">
                        {lead.name}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {domisiliLabel && (
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                              domisiliLabel.toLowerCase().includes('luar')
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {domisiliLabel}
                          </span>
                        )}
                        <span className="text-[11px] text-gray-400">
                          {lead.sourcePage}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold rounded-md border border-green-200 transition-colors"
                      >
                        <PhoneCall size={12} />
                        <span>{lead.whatsapp}</span>
                      </a>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-gray-800">
                        {lead.carInterest || 'Umum'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        disabled={updatingId === lead.id}
                        value={lead.status}
                        onChange={(e) =>
                          handleStatusChange(lead.id, e.target.value)
                        }
                        className={`text-xs font-bold px-2 py-1 rounded-md border focus:outline-none cursor-pointer ${getStatusBadge(
                          lead.status
                        )}`}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      {editingNotesId === lead.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Catatan..."
                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveNotes(lead.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded cursor-pointer"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingNotesId(lead.id);
                            setNoteText(lead.notes || '');
                          }}
                          className="cursor-pointer group flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
                        >
                          <span className="truncate">
                            {lead.notes || 'Tambah catatan...'}
                          </span>
                          <MessageSquare
                            size={12}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 shrink-0"
                          />
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-gray-400 font-mono">
                      {new Date(lead.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => promptSingleDelete(lead)}
                        title={`Hapus prospek ${lead.name}`}
                        aria-label={`Hapus prospek ${lead.name}`}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    Tidak ada data prospek yang sesuai pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Prospek */}
      <Dialog
        open={Boolean(deleteTargetIds)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTargetIds(null);
        }}
      >
        <DialogContent className="sm:max-w-md p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Konfirmasi Hapus Data Prospek
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                Tindakan ini menghapus data secara permanen dari database.
              </DialogDescription>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-2">
            Apakah Anda yakin ingin menghapus{' '}
            <strong className="text-gray-900">{deleteLabel}</strong>? Data yang
            dihapus akan langsung hilang dari Dasbor, Export Excel, dan Laporan
            PDF.
          </p>

          <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDeleteTargetIds(null)}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  <span>Ya, Hapus Permanen</span>
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
