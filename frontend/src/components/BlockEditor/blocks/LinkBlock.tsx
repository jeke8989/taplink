import React from 'react';
import { Link as LinkIcon } from 'lucide-react';

const inputClass =
  'w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

interface LinkBlockProps {
  content: {
    title?: string;
    url?: string;
    description?: string;
  };
  isEditing?: boolean;
  onChange?: (content: any) => void;
}

export const LinkBlock: React.FC<LinkBlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {
  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <LinkIcon size={16} />
          <span>Блок ссылки</span>
        </div>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange?.({ ...content, title: e.target.value })}
          placeholder="Заголовок ссылки"
          className={inputClass}
        />
        <input
          type="url"
          value={content.url || ''}
          onChange={(e) => onChange?.({ ...content, url: e.target.value })}
          placeholder="https://example.com"
          className={inputClass}
        />
        <input
          type="text"
          value={content.description || ''}
          onChange={(e) =>
            onChange?.({ ...content, description: e.target.value })
          }
          placeholder="Описание (необязательно)"
          className={inputClass}
        />
      </div>
    );
  }

  return (
    <a
      href={content.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white bg-opacity-20 hover:bg-opacity-30 transition-all px-6 py-4 rounded-xl text-center"
    >
      <div className="font-semibold">{content.title || 'Без названия'}</div>
      {content.description && (
        <div className="text-sm opacity-80 mt-1">{content.description}</div>
      )}
    </a>
  );
};

