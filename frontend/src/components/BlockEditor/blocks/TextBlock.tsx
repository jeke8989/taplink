import React from 'react';
import { AlignLeft } from 'lucide-react';

const inputClass =
  'w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

interface TextBlockProps {
  content: {
    text?: string;
  };
  isEditing?: boolean;
  onChange?: (content: Record<string, unknown>) => void;
}

export const TextBlock: React.FC<TextBlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {
  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <AlignLeft size={16} />
          <span>Текстовый блок</span>
        </div>
        <textarea
          value={content.text || ''}
          onChange={(e) => onChange?.({ ...content, text: e.target.value })}
          placeholder="Введите текст..."
          className={`${inputClass} resize-none`}
          rows={4}
        />
      </div>
    );
  }

  return (
    <div className="text-center whitespace-pre-wrap px-4 py-2">
      {content.text || 'Пустой текстовый блок'}
    </div>
  );
};
