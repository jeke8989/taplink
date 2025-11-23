import React, { useState, useRef } from 'react';
import { uploadImage, uploadImages } from '../api/upload';

interface ImageUploaderProps {
  onUploadComplete: (url: string | string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
  buttonText?: string;
  accept?: string;
  preview?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadComplete,
  multiple = false,
  maxFiles = 10,
  className = '',
  buttonText = 'Загрузить изображение',
  accept = 'image/jpeg,image/png,image/gif,image/webp',
  preview = true,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Валидация количества файлов
    if (multiple && files.length > maxFiles) {
      setError(`Максимум ${maxFiles} файлов`);
      return;
    }

    // Валидация размера файлов (макс 10MB на файл)
    const maxSize = 10 * 1024 * 1024; // 10MB
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxSize) {
        setError(`Размер файла "${files[i].name}" превышает 10MB`);
        return;
      }
    }

    setError(null);
    setUploading(true);

    try {
      // Создаём preview если нужно
      if (preview) {
        const urls = Array.from(files).map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
      }

      // Загружаем файлы
      if (multiple) {
        const filesArray = Array.from(files);
        const urls = await uploadImages(filesArray);
        onUploadComplete(urls);
      } else {
        const url = await uploadImage(files[0]);
        onUploadComplete(url);
      }

      // Очищаем input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Ошибка загрузки:', err);
      setError(err.response?.data?.message || 'Ошибка загрузки файла');
      setPreviewUrls([]);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removePreview = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`image-uploader ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      <button
        type="button"
        onClick={handleButtonClick}
        disabled={uploading}
        className={`
          px-4 py-2 rounded-lg font-medium transition-all
          ${uploading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
          }
        `}
      >
        {uploading ? (
          <span className="flex items-center gap-2">
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
          buttonText
        )}
      </button>

      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}

      {preview && previewUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removePreview(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        Разрешены: JPEG, PNG, GIF, WEBP. Максимум: 10MB {multiple && `(до ${maxFiles} файлов)`}
      </div>
    </div>
  );
};

export default ImageUploader;

