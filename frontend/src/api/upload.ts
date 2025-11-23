import api from './axios';

/**
 * Загрузить одно изображение
 * @param file - файл для загрузки
 * @returns URL загруженного изображения
 */
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url;
};

/**
 * Загрузить несколько изображений
 * @param files - массив файлов для загрузки
 * @returns массив URL загруженных изображений
 */
export const uploadImages = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await api.post('/upload/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.urls;
};

/**
 * Загрузить аватар
 * @param file - файл аватара
 * @returns URL загруженного аватара
 */
export const uploadAvatar = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url;
};

/**
 * Удалить файл из S3
 * @param url - URL файла для удаления
 */
export const deleteImage = async (url: string): Promise<void> => {
  await api.delete('/upload/delete', {
    data: { url },
  });
};

