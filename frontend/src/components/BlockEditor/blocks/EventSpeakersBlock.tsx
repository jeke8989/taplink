import React from 'react';
import { User, Plus, X, Linkedin, Twitter, Instagram } from 'lucide-react';
import ImageUploadButton from '../../ImageUploadButton';

const inputClass =
  'w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

interface Speaker {
  name: string;
  position: string;
  description?: string;
  photoUrl?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
}

interface EventSpeakersBlockProps {
  content: {
    speakers?: Speaker[];
  };
  isEditing?: boolean;
  onChange?: (content: Record<string, unknown>) => void;
}

export const EventSpeakersBlock: React.FC<EventSpeakersBlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {
  const speakers = content.speakers || [];

  if (isEditing) {
    const handleSpeakerChange = (index: number, field: keyof Speaker, value: string) => {
      const updated = [...speakers];
      updated[index] = { ...updated[index], [field]: value };
      onChange?.({ ...content, speakers: updated });
    };

    const handleAddSpeaker = () => {
      onChange?.({ ...content, speakers: [...speakers, { name: '', position: '', description: '' }] });
    };

    const handleRemoveSpeaker = (index: number) => {
      const updated = speakers.filter((_, i) => i !== index);
      onChange?.({ ...content, speakers: updated });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <User size={16} />
          <span>Спикеры</span>
        </div>
        <div className="space-y-4">
          {speakers.map((speaker, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Спикер {index + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSpeaker(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={16} />
                </button>
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Фото спикера</label>
                <ImageUploadButton
                  onUploadComplete={(url) => handleSpeakerChange(index, 'photoUrl', url)}
                  currentImage={speaker.photoUrl}
                  showPreview={true}
                  buttonClassName="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all"
                />
                <input
                  type="url"
                  value={speaker.photoUrl || ''}
                  onChange={(e) => handleSpeakerChange(index, 'photoUrl', e.target.value)}
                  placeholder="или URL: https://example.com/photo.jpg"
                  className={`${inputClass} mt-2`}
                />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Имя</label>
                <input
                  type="text"
                  value={speaker.name}
                  onChange={(e) => handleSpeakerChange(index, 'name', e.target.value)}
                  placeholder="Имя спикера"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Должность</label>
                <input
                  type="text"
                  value={speaker.position}
                  onChange={(e) => handleSpeakerChange(index, 'position', e.target.value)}
                  placeholder="Должность"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Описание (опционально)</label>
                <textarea
                  value={speaker.description || ''}
                  onChange={(e) => handleSpeakerChange(index, 'description', e.target.value)}
                  placeholder="Краткое описание"
                  className={`${inputClass} resize-none`}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-white/60 mb-1 block">LinkedIn</label>
                  <input
                    type="url"
                    value={speaker.linkedin || ''}
                    onChange={(e) => handleSpeakerChange(index, 'linkedin', e.target.value)}
                    placeholder="URL"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Twitter</label>
                  <input
                    type="url"
                    value={speaker.twitter || ''}
                    onChange={(e) => handleSpeakerChange(index, 'twitter', e.target.value)}
                    placeholder="URL"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Instagram</label>
                  <input
                    type="url"
                    value={speaker.instagram || ''}
                    onChange={(e) => handleSpeakerChange(index, 'instagram', e.target.value)}
                    placeholder="URL"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddSpeaker}
          className="flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200"
        >
          <Plus size={16} />
          Добавить спикера
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-10 rounded-xl p-6 text-white space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <User size={20} />
        <span>Спикеры</span>
      </div>
      {speakers.length === 0 ? (
        <div className="text-center text-white/60 py-4">
          Спикеры не указаны
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {speakers.map((speaker, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4 space-y-3">
              {speaker.photoUrl && (
                <img
                  src={speaker.photoUrl}
                  alt={speaker.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto"
                />
              )}
              <div className="text-center">
                <div className="font-semibold">{speaker.name || 'Без имени'}</div>
                <div className="text-sm opacity-80">{speaker.position || 'Без должности'}</div>
              </div>
              {speaker.description && (
                <div className="text-sm opacity-80 text-center">{speaker.description}</div>
              )}
              {(speaker.linkedin || speaker.twitter || speaker.instagram) && (
                <div className="flex items-center justify-center gap-3">
                  {speaker.linkedin && (
                    <a href={speaker.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">
                      <Linkedin size={18} />
                    </a>
                  )}
                  {speaker.twitter && (
                    <a href={speaker.twitter} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">
                      <Twitter size={18} />
                    </a>
                  )}
                  {speaker.instagram && (
                    <a href={speaker.instagram} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">
                      <Instagram size={18} />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

