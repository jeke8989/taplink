import { useState } from 'react';
import { uploadImage, uploadImages, uploadAvatar } from '../api/upload';

interface UseImageUploadReturn {
  uploading: boolean;
  error: string | null;
  uploadSingleImage: (file: File) => Promise<string | null>;
  uploadMultipleImages: (files: File[]) => Promise<string[] | null>;
  uploadAvatarImage: (file: File) => Promise<string | null>;
  clearError: () => void;
}

/**
 * Хук для удобной загрузки изображений
 * @returns объект с методами и состоянием загрузки
 */
export const useImageUpload = (): UseImageUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const uploadSingleImage = async (file: File): Promise<string | null> => {
    setError(null);
    setUploading(true);

    try {
      // Валидация
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Разрешены только изображения (JPEG, PNG, GIF, WEBP)');
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('Размер файла не должен превышать 10MB');
      }

      const url = await uploadImage(file);
      return url;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка загрузки файла';
      setError(errorMessage);
      console.error('Ошибка загрузки изображения:', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultipleImages = async (files: File[]): Promise<string[] | null> => {
    setError(null);
    setUploading(true);

    try {
      // Валидация
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`Файл "${file.name}" имеет неподдерживаемый формат`);
        }
        if (file.size > maxSize) {
          throw new Error(`Файл "${file.name}" превышает максимальный размер 10MB`);
        }
      }

      const urls = await uploadImages(files);
      return urls;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка загрузки файлов';
      setError(errorMessage);
      console.error('Ошибка загрузки изображений:', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadAvatarImage = async (file: File): Promise<string | null> => {
    setError(null);
    setUploading(true);

    try {
      // Валидация
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Разрешены только изображения (JPEG, PNG, GIF, WEBP)');
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('Размер файла не должен превышать 10MB');
      }

      const url = await uploadAvatar(file);
      return url;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка загрузки аватара';
      setError(errorMessage);
      console.error('Ошибка загрузки аватара:', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    error,
    uploadSingleImage,
    uploadMultipleImages,
    uploadAvatarImage,
    clearError,
  };
};

