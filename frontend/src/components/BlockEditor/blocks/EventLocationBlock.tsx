import React from 'react';
import { MapPin } from 'lucide-react';

const inputClass =
  'w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

interface EventLocationBlockProps {
  content: {
    address?: string;
    description?: string;
  };
  isEditing?: boolean;
  onChange?: (content: Record<string, unknown>) => void;
}

export const EventLocationBlock: React.FC<EventLocationBlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {
  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <MapPin size={16} />
          <span>Место проведения</span>
        </div>
        <input
          type="text"
          value={content.address || ''}
          onChange={(e) => onChange?.({ ...content, address: e.target.value })}
          placeholder="Адрес (улица, дом, город)"
          className={inputClass}
        />
        <textarea
          value={content.description || ''}
          onChange={(e) =>
            onChange?.({ ...content, description: e.target.value })
          }
          placeholder="Описание места (опционально)"
          className={`${inputClass} resize-none`}
          rows={3}
        />
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-10 rounded-xl p-6 text-white space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <MapPin size={20} />
        <span>Место проведения</span>
      </div>
      {content.description && (
        <div className="text-sm opacity-80">{content.description}</div>
      )}
      {content.address && (
        <div className="flex items-center gap-2 text-sm opacity-90">
          <MapPin size={16} className="text-white/60" />
          <span>{content.address}</span>
        </div>
      )}
    </div>
  );
};

