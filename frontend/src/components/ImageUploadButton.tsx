import React, { useState, useRef } from 'react';
import { uploadImage } from '../api/upload';

interface ImageUploadButtonProps {
  onUploadComplete: (url: string) => void;
  currentImage?: string;
  className?: string;
  buttonClassName?: string;
  showPreview?: boolean;
}

/**
 * Компактный компонент для загрузки одного изображения
 * Удобен для использования в формах и блоках
 */
const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
  onUploadComplete,
  currentImage,
  className = '',
  buttonClassName = '',
  showPreview = true,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    try {
      const url = await uploadImage(file);
      onUploadComplete(url);
      
      // Очищаем input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Ошибка загрузки:', err);
      setError(err.response?.data?.message || 'Ошибка загрузки файла');
      setPreviewUrl(currentImage); // Возвращаем старое изображение
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {showPreview && previewUrl && (
        <div className="mb-3">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleButtonClick}
        disabled={uploading}
        className={
          buttonClassName ||
          `
          w-full px-4 py-2 rounded-lg font-medium transition-all
          ${uploading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
          }
        `
        }
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
        ) : (
          previewUrl ? 'Изменить изображение' : 'Загрузить изображение'
        )}
      </button>

      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUploadButton;

