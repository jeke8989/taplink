import React from 'react';
import { Layers } from 'lucide-react';

const textareaClass =
  'w-full px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none font-mono text-sm';

interface CustomBlockProps {
  content: {
    html?: string;
  };
  isEditing?: boolean;
  onChange?: (content: any) => void;
}

export const CustomBlock: React.FC<CustomBlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {
  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Layers size={16} />
          <span>Свой блок (HTML)</span>
        </div>
        <textarea
          value={content.html || ''}
          onChange={(e) => onChange?.({ ...content, html: e.target.value })}
          placeholder="<div>Ваш HTML код</div>"
          className={textareaClass}
          rows={6}
        />
      </div>
    );
  }

  return (
    <div
      className="custom-block-content"
      dangerouslySetInnerHTML={{ __html: content.html || '<p>Пустой блок</p>' }}
    />
  );
};

