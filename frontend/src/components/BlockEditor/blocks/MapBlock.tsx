import React from 'react';
import { MapPin } from 'lucide-react';

const inputClass =
  'w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

interface MapBlockProps {
  content: {
    addresses?: string[];
    title?: string;
    description?: string;
  };
  isEditing?: boolean;
  onChange?: (content: any) => void;
}

export const MapBlock: React.FC<MapBlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {
  const addresses = content.addresses && content.addresses.length > 0
    ? content.addresses
    : [''];

  const handleAddressChange = (value: string, index: number) => {
    const updated = [...addresses];
    updated[index] = value;
    onChange?.({ ...content, addresses: updated });
  };

  const handleAddAddress = () => {
    onChange?.({ ...content, addresses: [...addresses, ''] });
  };

  const handleRemoveAddress = (index: number) => {
    const updated = addresses.filter((_, i) => i !== index);
    onChange?.({ ...content, addresses: updated.length ? updated : [''] });
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <MapPin size={16} />
          <span>Блок карты</span>
        </div>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange?.({ ...content, title: e.target.value })}
          placeholder="Заголовок (например, Офис)"
          className={inputClass}
        />
        <textarea
          value={content.description || ''}
          onChange={(e) =>
            onChange?.({ ...content, description: e.target.value })
          }
          placeholder="Описание (например, часы работы)"
          className={`${inputClass} resize-none`}
          rows={3}
        />
        <div className="space-y-2">
          {addresses.map((address, index) => (
            <div key={`address-${index}`} className="flex gap-2">
              <input
                type="text"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value, index)}
                placeholder="Адрес (улица, дом)"
                className={`${inputClass} flex-1`}
              />
              {addresses.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveAddress(index)}
                  className="px-3 text-sm text-red-500 hover:text-red-600"
                >
                  Удалить
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddAddress}
          className="text-sm text-blue-300 hover:text-blue-200"
        >
          + Добавить адрес
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-10 rounded-xl p-6 text-white space-y-3">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <MapPin size={20} />
        <span>{content.title || 'Наши локации'}</span>
      </div>
      {content.description && (
        <div className="text-sm opacity-80">{content.description}</div>
      )}
      <div className="space-y-2">
        {addresses
          .filter((addr) => addr?.trim())
          .map((address, index) => (
            <div
              key={`view-address-${index}`}
              className="flex items-center gap-2 text-sm opacity-90"
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white bg-opacity-20">
                {index + 1}
              </span>
              <span>{address}</span>
            </div>
          ))}
      </div>
    </div>
  );
};


