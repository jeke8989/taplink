import React from 'react';
import { User } from 'lucide-react';
import AvatarImageCropper from '../../AvatarImageCropper';

const inputClass =
  'w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

interface AvatarBlockProps {
  content: {
    avatarUrl?: string;
    name?: string;
    subtitle?: string;
  };
  isEditing?: boolean;
  onChange?: (content: Record<string, unknown>) => void;
}

export const AvatarBlock: React.FC<AvatarBlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {
  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <User size={16} />
          <span>Блок аватара</span>
        </div>
        <AvatarImageCropper
          currentImage={content.avatarUrl}
          onImageChange={(url) => onChange?.({ ...content, avatarUrl: url || '' })}
          size={150}
        />
        <input
          type="text"
          value={content.name || ''}
          onChange={(e) => onChange?.({ ...content, name: e.target.value })}
          placeholder="Имя"
          className={inputClass}
        />
        <input
          type="text"
          value={content.subtitle || ''}
          onChange={(e) => onChange?.({ ...content, subtitle: e.target.value })}
          placeholder="Подзаголовок"
          className={inputClass}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center py-4">
      {content.avatarUrl ? (
        <img
          src={content.avatarUrl}
          alt={content.name || 'Avatar'}
          className="w-24 h-24 rounded-full object-cover mb-3"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-3">
          <User size={40} className="text-gray-500" />
        </div>
      )}
      {content.name && <div className="font-bold text-lg">{content.name}</div>}
      {content.subtitle && (
        <div className="text-sm opacity-80">{content.subtitle}</div>
      )}
    </div>
  );
};

