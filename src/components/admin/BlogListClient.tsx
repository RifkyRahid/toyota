'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Upload,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import TiptapEditor from './TiptapEditor';

export interface BlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  isPublished: boolean;
  createdAt: string;
}

interface BlogListClientProps {
  initialBlogs: BlogItem[];
}

export default function BlogListClient({ initialBlogs }: BlogListClientProps) {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogItem[]>(initialBlogs);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('<p>Tulis artikel tips atau promo Toyota Batam di sini...</p>');
    setCoverImage('');
    setIsPublished(true);
    setModalOpen(true);
  };

  const openEditModal = (blog: BlogItem) => {
    setEditingId(blog.id);
    setTitle(blog.title);
    setSlug(blog.slug);
    setExcerpt(blog.excerpt);
    setContent(blog.content);
    setCoverImage(blog.coverImage);
    setIsPublished(blog.isPublished);
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) {
      const genSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(genSlug);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', 'general');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload gambar sampul gagal');
      const data = await res.json();
      setCoverImage(data.url);
      toast.success('Sampul berhasil diunggah.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error upload';
      toast.error(msg);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !slug || !excerpt || !content || !coverImage) {
      toast.error('Semua kolom wajib diisi termasuk gambar sampul.');
      return;
    }

    setSubmitting(true);
    const payload = {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      isPublished,
    };

    try {
      const url = editingId ? `/api/blogs/${editingId}` : '/api/blogs';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan artikel');
      }

      toast.success(editingId ? 'Artikel berhasil diperbarui.' : 'Artikel baru berhasil diterbitkan.');
      setModalOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, blogTitle: string) => {
    if (!confirm(`Hapus artikel "${blogTitle}"?`)) return;

    try {
      const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');

      setBlogs((prev) => prev.filter((b) => b.id !== id));
      toast.success('Artikel dihapus.');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus artikel.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Artikel Blog & Promo SEO
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Publikasikan tips otomotif, update promo bulanan, dan panduan kredit untuk pengunjung Batam.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer self-start"
        >
          <Plus size={17} />
          <span>Tulis Artikel Baru</span>
        </button>
      </div>

      {/* Blogs Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4">Artikel</th>
                <th className="py-3.5 px-4">Ringkasan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Tanggal Buat</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {blogs.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-10 bg-gray-100 rounded-md overflow-hidden shrink-0">
                        {b.coverImage ? (
                          <img
                            src={b.coverImage}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText size={18} className="text-gray-400 m-auto mt-2.5" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block line-clamp-1">
                          {b.title}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">/{b.slug}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs truncate text-xs text-gray-500">
                    {b.excerpt}
                  </td>

                  <td className="py-3.5 px-4">
                    {b.isPublished ? (
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-md border border-green-200">
                        Tayang
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md">
                        Draft
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-xs text-gray-400 font-mono">
                    {new Date(b.createdAt).toLocaleDateString('id-ID')}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(b)}
                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                        title="Edit Artikel"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(b.id, b.title)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Hapus Artikel"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {blogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Belum ada artikel blog. Klik &quot;Tulis Artikel Baru&quot; untuk memulai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Artikel Blog' : 'Tulis Artikel Blog Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-md"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Judul Artikel <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Contoh: Tips Merawat Mesin Mobil Toyota di Batam"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Slug URL <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="tips-merawat-mesin-toyota-batam"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Ringkasan / Excerpt (1-2 Kalimat SEO) <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Ringkasan singkat yang akan muncul di kartu artikel dan meta description Google..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Foto Sampul (Cover Image) <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center gap-4">
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt="Cover"
                      className="w-24 h-16 object-cover rounded-lg border border-gray-200"
                    />
                  )}
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors">
                    <Upload size={14} />
                    <span>{uploadingCover ? 'Mengunggah...' : 'Upload Gambar Sampul'}</span>
                    <input
                      type="file"
                      onChange={handleCoverUpload}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploadingCover}
                    />
                  </label>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="/uploads/sampul.webp"
                    className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Tiptap WYSIWYG Editor */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Konten Artikel (Tiptap Rich-Text Editor) <span className="text-red-600">*</span>
                </label>
                <TiptapEditor content={content} onChange={setContent} />
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="isPublished" className="text-sm font-semibold text-gray-800 cursor-pointer">
                  Terbitkan Langsung ke Publik
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Simpan Artikel</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
