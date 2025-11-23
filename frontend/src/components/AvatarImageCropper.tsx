import React, { useState, useRef, useEffect } from 'react';
import { uploadAvatar, deleteImage } from '../api/upload';
import { Trash2 } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface AvatarImageCropperProps {
  currentImage?: string;
  onImageChange: (url: string | null) => void;
  size?: number; // размер аватара в пикселях
}

/**
 * Компонент для загрузки и обрезки аватара с круглым preview
 * Позволяет перемещать и масштабировать изображение для выбора нужной области
 */
const AvatarImageCropper: React.FC<AvatarImageCropperProps> = ({
  currentImage,
  onImageChange,
  size = 200,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentImage) {
      setPreviewUrl(currentImage);
    } else {
      setPreviewUrl(null);
    }
    setImagePosition({ x: 0, y: 0 });
    setImageScale(1);
  }, [currentImage]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Валидация типа файла
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Разрешены только изображения (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Валидация размера файла (макс 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('Размер файла не должен превышать 10MB');
      return;
    }

    setError(null);
    setUploading(true);

    // Создаём preview
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);
    setImagePosition({ x: 0, y: 0 });
    setImageScale(1);

    try {
      const url = await uploadAvatar(file);
      setPreviewUrl(url);
      onImageChange(url);

      // Очищаем input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Ошибка загрузки:', err);
      setError(err.response?.data?.message || 'Ошибка загрузки файла');
      if (currentImage) {
        setPreviewUrl(currentImage);
      } else {
        setPreviewUrl(null);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!previewUrl || uploading || isDeleting) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !previewUrl) return;
    setImagePosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!previewUrl || uploading || isDeleting) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setImageScale((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleDelete = () => {
    if (!previewUrl) return;
    setConfirmDelete(true);
  };

  const confirmDeleteAction = async () => {
    if (!previewUrl) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteImage(previewUrl);
      setPreviewUrl(null);
      onImageChange(null);
    } catch (err: any) {
      console.error('Ошибка удаления:', err);
      setError(err.response?.data?.message || 'Ошибка удаления файла');
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading || isDeleting}
      />

      {/* Круглый preview с возможностью перемещения */}
      <div className="flex justify-center">
        <div
          ref={containerRef}
          className="relative"
          style={{ width: size, height: size }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Круглая маска */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden border-2 border-white/20"
            style={{ width: size, height: size }}
          >
            {previewUrl ? (
              <img
                ref={imageRef}
                src={previewUrl}
                alt="Avatar preview"
                className="select-none"
                style={{
                  width: `${size * imageScale}px`,
                  height: `${size * imageScale}px`,
                  objectFit: 'cover',
                  transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                  cursor: isDragging ? 'grabbing' : 'grab',
                }}
                draggable={false}
                onError={() => {
                  setPreviewUrl(null);
                  setError('Ошибка загрузки изображения');
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center rounded-full">
                <span className="text-gray-500 text-sm">Нет изображения</span>
              </div>
            )}
          </div>

          {/* Индикатор загрузки */}
          {(uploading || isDeleting) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
              <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          )}

          {/* Кнопка удаления */}
          {previewUrl && !uploading && !isDeleting && (
            <button
              type="button"
              onClick={handleDelete}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
              title="Удалить изображение"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Подсказка */}
      {previewUrl && (
        <div className="text-xs text-white/60 text-center">
          Перетащите изображение или используйте колесо мыши для масштабирования
        </div>
      )}

      {/* Кнопка загрузки */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={uploading || isDeleting}
        className={`
          w-full px-4 py-2 rounded-lg font-medium transition-all
          ${uploading || isDeleting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
          }
        `}
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Загрузка...
          </span>
        ) : previewUrl ? (
          'Изменить изображение'
        ) : (
          'Загрузить изображение'
        )}
      </button>

      {error && (
        <div className="text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete}
        title="Удалить изображение?"
        message="Вы уверены, что хотите удалить это изображение? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

export default AvatarImageCropper;

