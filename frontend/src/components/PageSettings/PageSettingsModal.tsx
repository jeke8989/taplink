import React, { useMemo, useState, useEffect, useRef } from 'react';
import { X, Copy, Lock, Globe, Download, CheckCircle2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import type { PageSettings } from './types';
import { defaultPageSettings } from './types';

export type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

interface PageSettingsModalProps {
  isOpen: boolean;
  initialSettings?: PageSettings;
  publicUrl: string;
  usernameStatus: UsernameStatus;
  usernameMessage?: string;
  onUsernameChange: (value: string) => void;
  onClose: () => void;
  onSave: (settings: PageSettings) => void;
  isSaving?: boolean;
}

type TabKey = 'link' | 'qr' | 'seo';

const baseInputClass =
  'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30';

export const PageSettingsModal: React.FC<PageSettingsModalProps> = ({
  isOpen,
  initialSettings,
  publicUrl,
  usernameStatus,
  usernameMessage,
  onUsernameChange,
  onClose,
  onSave,
  isSaving = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('link');
  const [form, setForm] = useState<PageSettings>(() => ({
    ...defaultPageSettings,
    ...initialSettings,
    qrColors: {
      ...defaultPageSettings.qrColors,
      ...(initialSettings?.qrColors || {}),
    },
  }));
  const [copied, setCopied] = useState(false);
  const usernameHelper = usernameMessage || 'Введите никнейм';
  const usernameTimeoutRef = useRef<number | null>(null);
  const usernameInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = <K extends keyof PageSettings>(
    key: K,
    value: PageSettings[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleColorChange = (key: keyof PageSettings['qrColors'], value: string) => {
    setForm((prev) => ({
      ...prev,
      qrColors: {
        ...prev.qrColors,
        [key]: value,
      },
    }));
  };

  const qrPreview = useMemo(() => {
    const qrValue = publicUrl;
    return (
      <div className="relative flex flex-col items-center gap-3">
        <div
          className="rounded-[28px] p-3 border shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
          style={{
            background: `linear-gradient(135deg, ${form.qrColors.accent}22, ${form.qrColors.frame}dd)`,
            borderColor: `${form.qrColors.frame}55`,
          }}
        >
          <div
            className="rounded-2xl p-3"
            style={{
              background: form.qrColors.background,
              border: `1px solid ${form.qrColors.frame}55`,
            }}
          >
            <QRCodeCanvas
              id="page-settings-qr"
              value={qrValue}
              size={210}
              bgColor={form.qrColors.background}
              fgColor={form.qrColors.glyph}
              level="H"
              includeMargin={false}
            />
          </div>
        </div>
        <div className="text-center">
          <div
            className="text-xs uppercase tracking-[0.35em] mb-1"
            style={{ color: `${form.qrColors.accent}b3` }}
          >
            {form.qrText}
          </div>
          <div
            className="text-sm font-medium"
            style={{ color: form.qrColors.accent }}
          >
            {qrValue}
          </div>
        </div>
      </div>
    );
  }, [form.qrText, form.qrColors, publicUrl]);

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'link', label: 'ССЫЛКА' },
    { key: 'qr', label: 'QR-КОД' },
    { key: 'seo', label: 'НАСТРОЙКИ SEO' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSave = () => {
    // Очищаем timeout при сохранении
    if (usernameTimeoutRef.current !== null) {
      clearTimeout(usernameTimeoutRef.current);
      usernameTimeoutRef.current = null;
    }
    // Вызываем onUsernameChange с финальным значением перед сохранением
    onUsernameChange(form.username);
    onSave({
      ...form,
      pageUrl: publicUrl,
    });
  };

  // Очищаем timeout при размонтировании
  useEffect(() => {
    return () => {
      if (usernameTimeoutRef.current !== null) {
        clearTimeout(usernameTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-w-2xl mx-auto mt-16 bg-[#181b25] text-white rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-sm text-white/60">Настройка страницы</p>
            <h2 className="text-xl font-semibold">{form.pageName}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pt-3">
          <div className="flex gap-3 border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-sm font-medium tracking-wide ${
                  activeTab === tab.key
                    ? 'text-white border-b-2 border-blue-400'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto space-y-6">
          {activeTab === 'link' && (
            <section className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-white/70 block mb-1">
                    Название страницы
                  </label>
                  <input
                    className={baseInputClass}
                    value={form.pageName}
                    onChange={(e) => handleChange('pageName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70 block mb-1">
                    Никнейм (адрес страницы)
                  </label>
                  <input
                    ref={usernameInputRef}
                    className={baseInputClass}
                    value={form.username}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                      
                      // Сохраняем позицию курсора и фокус
                      const input = e.target as HTMLInputElement;
                      const cursorPosition = input.selectionStart || 0;
                      const wasFocused = document.activeElement === input;
                      
                      handleChange('username', value);
                      
                      // Восстанавливаем фокус и позицию курсора сразу после обновления
                      if (wasFocused && usernameInputRef.current) {
                        // Используем useLayoutEffect через setTimeout(0) для немедленного восстановления
                        setTimeout(() => {
                          if (usernameInputRef.current && document.activeElement !== usernameInputRef.current) {
                            usernameInputRef.current.focus();
                            const newPosition = Math.min(cursorPosition, value.length);
                            usernameInputRef.current.setSelectionRange(newPosition, newPosition);
                          }
                        }, 0);
                      }
                      
                      // Используем debounce для вызова onUsernameChange (500ms)
                      if (usernameTimeoutRef.current !== null) {
                        clearTimeout(usernameTimeoutRef.current);
                      }
                      usernameTimeoutRef.current = window.setTimeout(() => {
                        onUsernameChange(value);
                        usernameTimeoutRef.current = null;
                      }, 500);
                    }}
                    onBlur={(e) => {
                      // Сохраняем фокус только если пользователь не кликнул в другое место
                      // Если фокус потерян не из-за клика вне инпута, восстанавливаем его
                      const relatedTarget = e.relatedTarget as HTMLElement | null;
                      if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
                        // Пользователь кликнул в другое место - это нормально, не восстанавливаем фокус
                        return;
                      }
                    }}
                    placeholder="username"
                  />
                  <p
                    className={`mt-1 text-xs ${
                      usernameStatus === 'taken' || usernameStatus === 'error'
                        ? 'text-red-400'
                        : usernameStatus === 'available'
                        ? 'text-green-400'
                        : 'text-white/50'
                    }`}
                  >
                    {usernameHelper}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm text-white/70 block mb-1">
                  Ссылка на страницу
                </label>
                <div className="flex gap-2">
                  <input
                    className={`${baseInputClass} flex-1`}
                    value={publicUrl}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                      className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm flex items-center gap-2"
                  >
                    <Copy size={16} />
                    {copied ? 'Скопировано' : 'Копировать'}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-white/70 block mb-2">
                  Настройки доступа
                </label>
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    {form.isPublic ? <Globe size={18} /> : <Lock size={18} />}
                    <div>
                      <p className="font-medium">
                        {form.isPublic
                          ? 'Страница доступна для всех'
                          : 'Доступ ограничен'}
                      </p>
                      <p className="text-sm text-white/60">
                        {form.isPublic
                          ? 'Любой по ссылке может просматривать страницу'
                          : 'Только вы можете просматривать страницу'}
                      </p>
                    </div>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.isPublic}
                      onChange={(e) => handleChange('isPublic', e.target.checked)}
                    />
                    <span className="w-12 h-6 bg-white/20 rounded-full p-1 flex items-center">
                      <span
                        className={`bg-white rounded-full w-4 h-4 transition-transform ${
                          form.isPublic ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </span>
                  </label>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'qr' && (
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">{qrPreview}</div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-sm text-white/70 block mb-1">
                      Подпись над QR
                    </label>
                    <input
                      className={baseInputClass}
                      value={form.qrText}
                      onChange={(e) => handleChange('qrText', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        ['frame', 'Цвет рамки'],
                        ['glyph', 'Цвет точек'],
                        ['background', 'Цвет фона'],
                        ['accent', 'Цвет подписи'],
                      ] as Array<[keyof PageSettings['qrColors'], string]>
                    ).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm"
                      >
                        {label}
                        <input
                          type="color"
                          value={form.qrColors[key]}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="w-12 h-8 bg-transparent border border-white/20 rounded"
                        />
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const canvas = document.getElementById(
                        'page-settings-qr',
                      ) as HTMLCanvasElement | null;
                      if (!canvas) return;
                      const pngUrl = canvas.toDataURL('image/png');
                      const link = document.createElement('a');
                      link.href = pngUrl;
                      link.download = `${form.username || 'biohub'}-qr.png`;
                      link.click();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl"
                  >
                    <Download size={18} />
                    Скачать PNG
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'seo' && (
            <section className="space-y-4">
              <p className="text-sm text-white/60">
                Настройки SEO для главной страницы можно настроить в общих
                настройках сайта
              </p>
              <div>
                <label className="text-sm text-white/70 block mb-1">
                  Заголовок страницы
                </label>
                <input
                  className={baseInputClass}
                  value={form.seoTitle}
                  onChange={(e) => handleChange('seoTitle', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-white/70 block mb-1">
                  SEO описание
                </label>
                <textarea
                  className={`${baseInputClass} min-h-[120px]`}
                  value={form.seoDescription}
                  onChange={(e) =>
                    handleChange('seoDescription', e.target.value)
                  }
                />
              </div>
              <div className="flex items-start justify-between bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <div>
                  <p className="font-medium">Запретить индексацию</p>
                  <p className="text-sm text-white/60">
                    Страница не будет отображаться в поисковых системах
                  </p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.noIndex}
                    onChange={(e) => handleChange('noIndex', e.target.checked)}
                  />
                  <span className="w-12 h-6 bg-white/20 rounded-full p-1 flex items-center">
                    <span
                      className={`bg-white rounded-full w-4 h-4 transition-transform ${
                        form.noIndex ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </span>
                </label>
              </div>
            </section>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/10 flex justify-end items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={
              isSaving ||
              usernameStatus === 'taken' ||
              usernameStatus === 'error' ||
              usernameStatus === 'checking' ||
              !form.username
            }
            className="px-6 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold flex items-center gap-2"
          >
            {isSaving ? (
              'Сохранение...'
            ) : (
              <>
                {usernameStatus === 'available' && <CheckCircle2 size={18} />}
                Сохранить
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

