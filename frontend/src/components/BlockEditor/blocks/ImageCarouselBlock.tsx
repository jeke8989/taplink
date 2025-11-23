import React, { useState } from 'react';
import { Image, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import ImageUploadButton from '../../ImageUploadButton';
import { deleteImage } from '../../../api/upload';

const inputClass =
  'w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

interface ImageCarouselBlockProps {
  content: {
    images?: string[];
    title?: string;
    autoplay?: boolean;
    autoplayInterval?: number;
  };
  isEditing?: boolean;
  onChange?: (content: Record<string, unknown>) => void;
}

export const ImageCarouselBlock: React.FC<ImageCarouselBlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const images = content.images || [];
  const title = content.title || '';
  const autoplay = content.autoplay ?? true;
  const autoplayInterval = content.autoplayInterval || 3000;

  // Автопрокрутка
  React.useEffect(() => {
    if (!isEditing && autoplay && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, autoplayInterval);
      return () => clearInterval(interval);
    }
  }, [isEditing, autoplay, images.length, autoplayInterval]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (isEditing) {
    const handleImageChange = (index: number, url: string) => {
      const updated = [...images];
      updated[index] = url;
      onChange?.({ ...content, images: updated });
    };

    const handleAddImage = () => {
      onChange?.({ ...content, images: [...images, ''] });
    };

    const handleRemoveImage = async (index: number) => {
      const imageUrl = images[index];
      
      // Если есть изображение, удаляем его из S3
      if (imageUrl && imageUrl.trim() !== '') {
        try {
          setIsDeleting(index);
          await deleteImage(imageUrl);
        } catch (err: unknown) {
          console.error('Ошибка удаления изображения из S3:', err);
          // Продолжаем удаление из массива даже если не удалось удалить из S3
        } finally {
          setIsDeleting(null);
        }
      }

      const updated = images.filter((_, i) => i !== index);
      onChange?.({ ...content, images: updated });
      if (currentIndex >= updated.length && updated.length > 0) {
        setCurrentIndex(updated.length - 1);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Image size={16} />
          <span>Карусель картинок</span>
        </div>

        {title !== undefined && (
          <div>
            <label className="block text-xs text-white/60 mb-1">Заголовок (опционально)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => onChange?.({ ...content, title: e.target.value })}
              placeholder="Заголовок карусели"
              className={inputClass}
            />
          </div>
        )}

        <div className="space-y-3">
          {images.map((imageUrl, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Изображение {index + 1}</span>
                {imageUrl && imageUrl.trim() !== '' && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    disabled={isDeleting === index}
                    className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <ImageUploadButton
                onUploadComplete={(url) => handleImageChange(index, url)}
                currentImage={imageUrl}
                showPreview={true}
                buttonClassName="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all"
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

        <div className="flex items-center gap-4 pt-2 border-t border-white/10">
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={autoplay}
              onChange={(e) => onChange?.({ ...content, autoplay: e.target.checked })}
              className="rounded"
            />
            <span>Автопрокрутка</span>
          </label>
          {autoplay && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/60">Интервал (мс):</label>
              <input
                type="number"
                min={1000}
                step={500}
                value={autoplayInterval}
                onChange={(e) =>
                  onChange?.({ ...content, autoplayInterval: Number(e.target.value) })
                }
                className="w-20 px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="bg-white bg-opacity-10 rounded-xl p-6 text-white text-center">
        <Image size={32} className="mx-auto mb-2 text-white/60" />
        <p className="text-white/60">Карусель пуста. Добавьте изображения в режиме редактирования.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4 text-center">{title}</h3>
      )}
      
      <div className="relative overflow-hidden rounded-2xl bg-white/5 shadow-xl">
        {/* Карусель */}
        <div className="relative aspect-video group">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentIndex 
                  ? 'opacity-100 scale-100 z-0' 
                  : 'opacity-0 scale-105 z-0'
              }`}
            >
              <img
                src={imageUrl}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* Градиент снизу для лучшей видимости индикаторов */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          ))}

          {/* Навигационные стрелки */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white rounded-full p-2.5 transition-all z-10 opacity-0 group-hover:opacity-100 shadow-lg"
                aria-label="Предыдущее изображение"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white rounded-full p-2.5 transition-all z-10 opacity-0 group-hover:opacity-100 shadow-lg"
                aria-label="Следующее изображение"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Индикаторы (точки) */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 bg-white shadow-lg'
                      : 'w-2 bg-white/60 hover:bg-white/80'
                  }`}
                  aria-label={`Перейти к слайду ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Счетчик слайдов */}
      {images.length > 1 && (
        <div className="text-center mt-3 text-xs text-white/50 font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

