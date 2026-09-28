'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  ImageIcon,
  Loader2,
  Undo,
  Redo,
} from 'lucide-react';
import { toast } from 'sonner';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
    ],
    content: content || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[220px] p-4 text-gray-800 leading-relaxed',
      },
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', 'general');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal mengunggah gambar');
      }

      const { url } = await res.json();
      if (editor) {
        editor.chain().focus().setImage({ src: url }).run();
        toast.success('Gambar berhasil disisipkan.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal upload gambar';
      toast.error(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!editor) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
        <Loader2 className="animate-spin mr-2" size={16} />
        Memuat editor teks...
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive('bold')
              ? 'bg-red-100 text-red-700'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          title="Tebal (Ctrl+B)"
        >
          <Bold size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive('italic')
              ? 'bg-red-100 text-red-700'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          title="Miring (Ctrl+I)"
        >
          <Italic size={16} />
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-red-100 text-red-700'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-red-100 text-red-700'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-red-100 text-red-700'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          title="Daftar Bullet"
        >
          <List size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-red-100 text-red-700'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          title="Daftar Angka"
        >
          <ListOrdered size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-red-100 text-red-700'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          title="Kutipan"
        >
          <Quote size={16} />
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Image Upload Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          title="Sisipkan Foto (JPG, PNG, WebP)"
        >
          {uploading ? <Loader2 size={16} className="animate-spin text-red-600" /> : <ImageIcon size={16} />}
          <span className="text-xs font-semibold">Upload Foto</span>
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1 ml-auto" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-200 disabled:opacity-30 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-200 disabled:opacity-30 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo size={16} />
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
