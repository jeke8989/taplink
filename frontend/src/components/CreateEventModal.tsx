import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { CreateEventDto } from '../api/events';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateEventDto) => Promise<void>;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSlugChange = (value: string) => {
    // Автоматически генерируем slug из title
    const autoSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setSlug(autoSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!title.trim()) {
      setError('Название обязательно');
      setLoading(false);
      return;
    }

    if (!slug.trim()) {
      setError('Slug обязателен');
      setLoading(false);
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError('Slug может содержать только строчные буквы, цифры и дефисы');
      setLoading(false);
      return;
    }

    try {
      await onCreate({ title: title.trim(), slug: slug.trim(), description: description.trim() || undefined });
      setTitle('');
      setSlug('');
      setDescription('');
      onClose();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Ошибка при создании мероприятия';
      setError(errorMessage || 'Ошибка при создании мероприятия');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Создать мероприятие</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="text-sm text-white/70 mb-1 block">Название мероприятия *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                handleSlugChange(e.target.value);
              }}
              placeholder="Например: Tech Conference 2024"
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
              required
            />
          </div>
          <div>
            <label className="text-sm text-white/70 mb-1 block">Slug (URL) *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                setSlug(value);
              }}
              placeholder="tech-conference-2024"
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
              required
              pattern="[a-z0-9-]+"
            />
            <p className="text-xs text-white/50 mt-1">
              Только строчные буквы, цифры и дефисы. Будет использоваться в URL: /username/{slug}
            </p>
          </div>
          <div>
            <label className="text-sm text-white/70 mb-1 block">Описание (опционально)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание мероприятия"
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

