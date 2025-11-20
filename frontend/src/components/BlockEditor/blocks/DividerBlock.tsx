import React from 'react';
import { Minus } from 'lucide-react';

const selectClass =
  'w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/40';

interface DividerBlockProps {
  content: {
    style?: 'solid' | 'dashed' | 'dotted';
  };
  isEditing?: boolean;
  onChange?: (content: any) => void;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {
  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Minus size={16} />
          <span>Разделитель</span>
        </div>
        <select
          value={content.style || 'solid'}
          onChange={(e) =>
            onChange?.({ ...content, style: e.target.value as any })
          }
          className={selectClass}
        >
          <option value="solid">Сплошная линия</option>
          <option value="dashed">Пунктирная линия</option>
          <option value="dotted">Точечная линия</option>
        </select>
      </div>
    );
  }

  const borderStyle = content.style || 'solid';

  return (
    <div className="py-4">
      <hr
        className="border-current opacity-30"
        style={{ borderTopStyle: borderStyle }}
      />
    </div>
  );
};

