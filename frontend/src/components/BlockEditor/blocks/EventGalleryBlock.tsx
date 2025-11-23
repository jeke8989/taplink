import React, { useState } from 'react';
import { Image, Plus, X } from 'lucide-react';
import ImageUploadButton from '../../ImageUploadButton';

const inputClass =
  'w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

interface EventGalleryBlockProps {
  content: {
    images?: string[];
  };
  isEditing?: boolean;
  onChange?: (content: Record<string, unknown>) => void;
}

export const EventGalleryBlock: React.FC<EventGalleryBlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const images = content.images || [];

  if (isEditing) {
    const handleImageChange = (index: number, value: string) => {
      const updated = [...images];
      updated[index] = value;
      onChange?.({ ...content, images: updated });
    };

    const handleAddImage = () => {
      onChange?.({ ...content, images: [...images, ''] });
    };

    const handleRemoveImage = (index: number) => {
      const updated = images.filter((_, i) => i !== index);
      onChange?.({ ...content, images: updated });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Image size={16} />
          <span>Галерея</span>
        </div>
        <div className="space-y-3">
          {images.map((imageUrl, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Изображение {index + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={16} />
                </button>
              </div>
              <ImageUploadButton
                onUploadComplete={(url) => handleImageChange(index, url)}
                currentImage={imageUrl}
                showPreview={true}
                buttonClassName="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all"
              />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => handleImageChange(index, e.target.value)}
                placeholder="или вставьте URL: https://example.com/image.jpg"
                className={inputClass}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddImage}
          className="flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200"
        >
          <Plus size={16} />
          Добавить изображение
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-10 rounded-xl p-6 text-white space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Image size={20} />
        <span>Галерея</span>
      </div>
      {images.length === 0 ? (
        <div className="text-center text-white/60 py-4">
          Изображения не добавлены
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((imageUrl, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setLightboxImage(imageUrl)}
              >
                <img
                  src={imageUrl}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
          {lightboxImage && (
            <div
              className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
              onClick={() => setLightboxImage(null)}
            >
              <button
                className="absolute top-4 right-4 text-white hover:text-gray-300"
                onClick={() => setLightboxImage(null)}
              >
                <X size={32} />
              </button>
              <img
                src={lightboxImage}
                alt="Lightbox"
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

