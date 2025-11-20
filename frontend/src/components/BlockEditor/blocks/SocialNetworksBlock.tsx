import React from 'react';
import { Share2 } from 'lucide-react';

const inputClass =
  'w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

interface SocialNetworksBlockProps {
  content: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    vk?: string;
  };
  isEditing?: boolean;
  onChange?: (content: any) => void;
}

export const SocialNetworksBlock: React.FC<SocialNetworksBlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {
  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Share2 size={16} />
          <span>Социальные сети</span>
        </div>
        <input
          type="text"
          value={content.instagram || ''}
          onChange={(e) => onChange?.({ ...content, instagram: e.target.value })}
          placeholder="Instagram (username)"
          className={inputClass}
        />
        <input
          type="text"
          value={content.facebook || ''}
          onChange={(e) => onChange?.({ ...content, facebook: e.target.value })}
          placeholder="Facebook (URL)"
          className={inputClass}
        />
        <input
          type="text"
          value={content.twitter || ''}
          onChange={(e) => onChange?.({ ...content, twitter: e.target.value })}
          placeholder="Twitter (username)"
          className={inputClass}
        />
        <input
          type="text"
          value={content.linkedin || ''}
          onChange={(e) => onChange?.({ ...content, linkedin: e.target.value })}
          placeholder="LinkedIn (URL)"
          className={inputClass}
        />
        <input
          type="text"
          value={content.youtube || ''}
          onChange={(e) => onChange?.({ ...content, youtube: e.target.value })}
          placeholder="YouTube (URL)"
          className={inputClass}
        />
        <input
          type="text"
          value={content.vk || ''}
          onChange={(e) => onChange?.({ ...content, vk: e.target.value })}
          placeholder="VK (URL)"
          className={inputClass}
        />
      </div>
    );
  }

  const socialLinks = [
    { name: 'Instagram', url: content.instagram ? `https://instagram.com/${content.instagram}` : null },
    { name: 'Facebook', url: content.facebook },
    { name: 'Twitter', url: content.twitter ? `https://twitter.com/${content.twitter}` : null },
    { name: 'LinkedIn', url: content.linkedin },
    { name: 'YouTube', url: content.youtube },
    { name: 'VK', url: content.vk },
  ].filter((link) => link.url);

  return (
    <div className="flex flex-wrap gap-3 justify-center py-4">
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url!}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white bg-opacity-20 hover:bg-opacity-30 px-5 py-2 rounded-full transition-all"
        >
          {link.name}
        </a>
      ))}
    </div>
  );
};

