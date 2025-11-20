import React from 'react';
import { MessageSquare } from 'lucide-react';

const inputClass =
  'w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

interface MessengersBlockProps {
  content: {
    telegram?: string;
    whatsapp?: string;
    viber?: string;
  };
  isEditing?: boolean;
  onChange?: (content: any) => void;
}

export const MessengersBlock: React.FC<MessengersBlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {
  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <MessageSquare size={16} />
          <span>Мессенджеры</span>
        </div>
        <input
          type="text"
          value={content.telegram || ''}
          onChange={(e) => onChange?.({ ...content, telegram: e.target.value })}
          placeholder="Telegram (username или ссылка)"
          className={inputClass}
        />
        <input
          type="text"
          value={content.whatsapp || ''}
          onChange={(e) => onChange?.({ ...content, whatsapp: e.target.value })}
          placeholder="WhatsApp (номер телефона)"
          className={inputClass}
        />
        <input
          type="text"
          value={content.viber || ''}
          onChange={(e) => onChange?.({ ...content, viber: e.target.value })}
          placeholder="Viber (номер телефона)"
          className={inputClass}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center py-4">
      {content.telegram && (
        <a
          href={
            content.telegram.startsWith('http')
              ? content.telegram
              : `https://t.me/${content.telegram}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
        >
          Telegram
        </a>
      )}
      {content.whatsapp && (
        <a
          href={`https://wa.me/${content.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors"
        >
          WhatsApp
        </a>
      )}
      {content.viber && (
        <a
          href={`viber://chat?number=${content.viber.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-purple-500 text-white px-6 py-2 rounded-full hover:bg-purple-600 transition-colors"
        >
          Viber
        </a>
      )}
    </div>
  );
};

