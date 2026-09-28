'use client';

import { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
}

export default function TagInput({
  value = [],
  onChange,
  placeholder = 'Ketik fitur lalu tekan Enter (misal: LED Headlamp)',
  label,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    if (!value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}

      {/* Input container */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <Plus size={16} />
          <span>Tambah</span>
        </button>
      </div>

      {/* Tags / Pills Display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2.5 bg-gray-50/70 border border-gray-100 rounded-lg min-h-[42px]">
          {value.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 shadow-xs text-xs font-medium text-gray-800 rounded-md"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="text-gray-400 hover:text-red-600 focus:outline-none"
                aria-label={`Hapus ${tag}`}
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
