'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, Search, MessageSquare, PhoneCall, Check } from 'lucide-react';
import { toast } from 'sonner';

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
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('SEMUA');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

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
        'Unit Minat': l.carInterest || 'Umum / Pricelist',
        'Sumber Halaman': l.sourcePage,
        'Status Prospek': l.status,
        'Catatan Sales': l.notes || '-',
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Prospek');

      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(workbook, `Data-Prospek-Agung-Toyota-Batam-${dateStr}.xlsx`);
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
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus as LeadItem['status'] } : l))
      );
      toast.success('Status prospek berhasil diperbarui.');
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

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.whatsapp.includes(search) ||
      (lead.carInterest && lead.carInterest.toLowerCase().includes(search.toLowerCase())) ||
      (lead.notes && lead.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'SEMUA' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
            Data Prospek & Leads Calon Pembeli
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Daftar calon pembeli yang masuk melalui form pricelist, katalog, atau tombol kontak.
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
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

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4">Calon Pembeli</th>
                <th className="py-3.5 px-4">Kontak WhatsApp</th>
                <th className="py-3.5 px-4">Minat Unit</th>
                <th className="py-3.5 px-4">Status Pipeline</th>
                <th className="py-3.5 px-4">Catatan Sales</th>
                <th className="py-3.5 px-4">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.map((lead) => {
                const waClean = lead.whatsapp.replace(/\D/g, '');
                const waUrl = `https://wa.me/${waClean}?text=${encodeURIComponent(
                  `Halo Bapak/Ibu ${lead.name}, saya dari Agung Toyota Batam menindaklanjuti permintaan informasi unit Toyota.`
                )}`;

                return (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-900 block">{lead.name}</span>
                      <span className="text-[11px] text-gray-400 block">{lead.sourcePage}</span>
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
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
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
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
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
                          <span className="truncate">{lead.notes || 'Tambah catatan...'}</span>
                          <MessageSquare size={12} className="opacity-0 group-hover:opacity-100 text-gray-400 shrink-0" />
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-gray-400 font-mono">
                      {new Date(lead.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                  </tr>
                );
              })}

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Tidak ada data prospek yang sesuai pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
