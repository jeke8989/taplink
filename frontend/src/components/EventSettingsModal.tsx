import React, { useMemo, useState } from 'react';
import { X, Copy, Download, CheckCircle2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import type { Event, UpdateEventDto } from '../api/events';

interface EventSettingsModalProps {
  isOpen: boolean;
  event: Event | null;
  publicUrl: string;
  onClose: () => void;
  onSave: (id: string, data: UpdateEventDto) => Promise<void>;
  isSaving?: boolean;
}

const baseInputClass =
  'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30';

export const EventSettingsModal: React.FC<EventSettingsModalProps> = ({
  isOpen,
  event,
  publicUrl,
  onClose,
  onSave,
  isSaving = false,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'qr'>('settings');
  const [title, setTitle] = useState(event?.title || '');
  const [slug, setSlug] = useState(event?.slug || '');
  const [description, setDescription] = useState(event?.description || '');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (event) {
      setTitle(event.title);
      setSlug(event.slug);
      setDescription(event.description || '');
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('event-settings-qr') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `event-qr-${event.slug}.png`;
      link.href = url;
      link.click();
    }
  };

  const handleSave = async () => {
    setError('');
    
    if (!title.trim()) {
      setError('Название обязательно');
      return;
    }

    if (!slug.trim()) {
      setError('Slug обязателен');
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError('Slug может содержать только строчные буквы, цифры и дефисы');
      return;
    }

    try {
      await onSave(event.id, {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Ошибка при сохранении';
      setError(errorMessage || 'Ошибка при сохранении');
    }
  };

  const qrPreview = useMemo(() => {
    return (
      <div className="relative flex flex-col items-center gap-3">
        <div className="rounded-[28px] p-3 border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.45)] bg-gradient-to-br from-purple-900/30 to-pink-900/30">
          <div className="rounded-2xl p-3 bg-white border border-white/20">
            <QRCodeCanvas
              id="event-settings-qr"
              value={publicUrl}
              size={210}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin={false}
            />
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.35em] mb-1 text-white/60">
            BioHub
          </div>
          <div className="text-xs text-white/40">Мероприятие</div>
        </div>
      </div>
    );
  }, [publicUrl]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Настройки мероприятия</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-white border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Настройки
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'qr'
                ? 'text-white border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            QR код
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'settings' ? (
            <div className="space-y-4">
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
                  onChange={(e) => setTitle(e.target.value)}
                  className={baseInputClass}
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
                  className={baseInputClass}
                  required
                  pattern="[a-z0-9-]+"
                />
                <p className="text-xs text-white/50 mt-1">
                  Только строчные буквы, цифры и дефисы. Будет использоваться в URL: /username/{slug}
                </p>
              </div>
              <div>
                <label className="text-sm text-white/70 mb-1 block">Описание</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${baseInputClass} resize-none`}
                  rows={4}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {qrPreview}
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-white/70 mb-1 block">Ссылка на мероприятие</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={publicUrl}
                      readOnly
                      className={`${baseInputClass} flex-1`}
                    />
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 size={18} className="text-green-400" />
                          Скопировано
                        </>
                      ) : (
                        <>
                          <Copy size={18} />
                          Копировать
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleDownloadQR}
                  className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Скачать QR код
                </button>
              </div>
            </div>
          )}
        </div>

        {activeTab === 'settings' && (
          <div className="px-6 py-4 border-t border-gray-700 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

