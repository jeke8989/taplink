import React from 'react';
import { List } from 'lucide-react';

const inputClass =
  'w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

interface IconTextBlockProps {
  content: {
    icon?: string;
    text?: string;
  };
  isEditing?: boolean;
  onChange?: (content: any) => void;
}

export const IconTextBlock: React.FC<IconTextBlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {
  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <List size={16} />
          <span>Иконка и текст</span>
        </div>
        <input
          type="text"
          value={content.icon || ''}
          onChange={(e) => onChange?.({ ...content, icon: e.target.value })}
          placeholder="Эмодзи или символ"
          className={inputClass}
        />
        <input
          type="text"
          value={content.text || ''}
          onChange={(e) => onChange?.({ ...content, text: e.target.value })}
          placeholder="Текст"
          className={inputClass}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-6 py-3">
      <span className="text-2xl">{content.icon || '📌'}</span>
      <span>{content.text || 'Текст с иконкой'}</span>
    </div>
  );
};

