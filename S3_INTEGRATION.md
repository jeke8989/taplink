# 📸 Интеграция S3 хранилища для загрузки изображений

## ✅ Что было реализовано

### Backend (Nest.js)

1. **Upload Module** (`backend/src/upload/`)
   - `upload.service.ts` - сервис для работы с S3 (AWS SDK)
   - `upload.controller.ts` - API endpoints для загрузки
   - `upload.module.ts` - модуль загрузки

2. **API Endpoints**
   - `POST /upload/image` - загрузить одно изображение
   - `POST /upload/images` - загрузить несколько изображений (до 10)
   - `POST /upload/avatar` - загрузить аватар

3. **Особенности**
   - Валидация типов файлов (JPEG, PNG, GIF, WEBP)
   - Ограничение размера файла (10MB)
   - Автоматическая генерация уникальных имен (UUID)
   - Публичный доступ к загруженным файлам
   - JWT авторизация для всех endpoints

### Frontend (React)

1. **API клиент** (`frontend/src/api/upload.ts`)
   - `uploadImage()` - загрузить одно изображение
   - `uploadImages()` - загрузить несколько изображений
   - `uploadAvatar()` - загрузить аватар

2. **Компоненты**
   - `ImageUploader.tsx` - полнофункциональный компонент с multiple upload
   - `ImageUploadButton.tsx` - компактный компонент для одного изображения

3. **Хуки**
   - `useImageUpload` - хук для полного контроля над загрузкой

4. **Интегрированные блоки**
   - ✅ `AvatarBlock` - загрузка аватара
   - ✅ `EventGalleryBlock` - загрузка галереи
   - ✅ `EventSpeakersBlock` - загрузка фото спикеров

### Переменные окружения

#### Backend (.env)
```env
# S3 Storage Configuration
S3_ENDPOINT=https://s3.twcstorage.ru
S3_BUCKET=50c4aa15-b1cfc493-c256-4b3e-8b12-f6a10518200e
S3_REGION=ru-1
S3_ACCESS_KEY_ID=YNRUA3Q8FL3DCDJL0OGP
S3_SECRET_ACCESS_KEY=ykrAm82mZA2vQKy7fxOry3hXCDHU7e9JAkWwIZHZ
S3_FORCE_PATH_STYLE=true

# Swift Storage Configuration (альтернатива)
SWIFT_URL=https://swift.twcstorage.ru
SWIFT_ACCESS_KEY=rp74671:swift
SWIFT_SECRET_ACCESS_KEY=ihdIv109FhvzDhKslHncDcNSapbT9oKqpGecpiNL
```

#### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:3000

# S3 Storage Configuration (для клиентской загрузки, если нужно)
VITE_S3_ENDPOINT=https://s3.twcstorage.ru
VITE_S3_BUCKET=50c4aa15-b1cfc493-c256-4b3e-8b12-f6a10518200e
VITE_S3_REGION=ru-1
```

## 🚀 Использование

### Пример 1: Простая загрузка в компоненте

```tsx
import ImageUploadButton from './components/ImageUploadButton';

const MyComponent = () => {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <ImageUploadButton
      onUploadComplete={setImageUrl}
      currentImage={imageUrl}
    />
  );
};
```

### Пример 2: Множественная загрузка

```tsx
import ImageUploader from './components/ImageUploader';

const Gallery = () => {
  const handleUpload = (urls: string | string[]) => {
    console.log('Загружено:', urls);
  };

  return (
    <ImageUploader
      onUploadComplete={handleUpload}
      multiple={true}
      maxFiles={5}
    />
  );
};
```

### Пример 3: Использование хука

```tsx
import { useImageUpload } from '../hooks/useImageUpload';

const CustomUploader = () => {
  const { uploading, error, uploadSingleImage } = useImageUpload();

  const handleUpload = async (file: File) => {
    const url = await uploadSingleImage(file);
    if (url) {
      console.log('Загружено:', url);
    }
  };

  return (
    <div>
      {uploading && <p>Загрузка...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {/* ваш UI */}
    </div>
  );
};
```

## 📋 Ограничения

- **Форматы:** JPEG, PNG, GIF, WEBP
- **Максимальный размер:** 10MB на файл
- **Максимум файлов:** 10 за один запрос
- **Авторизация:** Требуется JWT токен

## 📚 Документация

Полное руководство: `frontend/src/components/IMAGE_UPLOAD_GUIDE.md`

## 🔒 Безопасность

- Все endpoints защищены JWT авторизацией
- Валидация типов файлов на backend
- Валидация размера файлов на backend
- Уникальные имена файлов (UUID)
- Публичный доступ к загруженным файлам (ACL: public-read)

## 🎨 UI/UX

- Индикатор загрузки (spinner)
- Preview загруженных изображений
- Обработка ошибок с понятными сообщениями
- Возможность удаления preview
- Поддержка drag & drop (встроено в input[type="file"])

## 📦 Установленные пакеты

### Backend
- `@aws-sdk/client-s3` - AWS SDK для работы с S3
- `multer` - middleware для загрузки файлов
- `@types/multer` - типы для multer
- `uuid` - генерация уникальных ID

### Frontend
- Используются только встроенные возможности React и Axios

## 🔄 Следующие шаги (опционально)

1. Добавить возможность удаления файлов из S3
2. Добавить обрезку и сжатие изображений на клиенте
3. Добавить поддержку видео
4. Добавить прогресс-бар загрузки
5. Добавить drag & drop интерфейс

---

**Автор:** AI Assistant  
**Дата:** 2025-11-23

