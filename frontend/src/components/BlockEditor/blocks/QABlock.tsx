import React from 'react';
import { MessageCircle } from 'lucide-react';

const inputClass =
  'w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

interface QABlockProps {
  content: {
    question?: string;
    answer?: string;
  };
  isEditing?: boolean;
  onChange?: (content: any) => void;
}

export const QABlock: React.FC<QABlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {
  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <MessageCircle size={16} />
          <span>Вопросы и ответы</span>
        </div>
        <input
          type="text"
          value={content.question || ''}
          onChange={(e) => onChange?.({ ...content, question: e.target.value })}
          placeholder="Вопрос"
          className={inputClass}
        />
        <textarea
          value={content.answer || ''}
          onChange={(e) => onChange?.({ ...content, answer: e.target.value })}
          placeholder="Ответ"
          className={`${inputClass} resize-none`}
          rows={3}
        />
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-20 px-6 py-4 rounded-xl">
      <div className="font-semibold mb-2">{content.question || 'Вопрос?'}</div>
      <div className="text-sm opacity-90">
        {content.answer || 'Ответ на вопрос'}
      </div>
    </div>
  );
};

