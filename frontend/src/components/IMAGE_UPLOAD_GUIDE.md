# Руководство по загрузке изображений

## Доступные компоненты и хуки

### 1. ImageUploader (полнофункциональный)
Универсальный компонент с поддержкой множественной загрузки и preview.

```tsx
import ImageUploader from './components/ImageUploader';

<ImageUploader
  onUploadComplete={(url) => console.log('Загружено:', url)}
  multiple={false}
  preview={true}
  buttonText="Загрузить фото"
/>
```

**Props:**
- `onUploadComplete`: `(url: string | string[]) => void` - колбэк после успешной загрузки
- `multiple?`: `boolean` - разрешить множественную загрузку (по умолчанию: false)
- `maxFiles?`: `number` - максимум файлов для множественной загрузки (по умолчанию: 10)
- `className?`: `string` - CSS классы для обёртки
- `buttonText?`: `string` - текст кнопки
- `accept?`: `string` - разрешённые типы файлов
- `preview?`: `boolean` - показывать preview (по умолчанию: true)

---

### 2. ImageUploadButton (компактный)
Компактный компонент для одного изображения. Удобен для форм и блоков.

```tsx
import ImageUploadButton from './components/ImageUploadButton';

<ImageUploadButton
  onUploadComplete={(url) => setImageUrl(url)}
  currentImage={imageUrl}
  showPreview={true}
/>
```

**Props:**
- `onUploadComplete`: `(url: string) => void` - колбэк после успешной загрузки
- `currentImage?`: `string` - текущее изображение (для preview)
- `className?`: `string` - CSS классы для обёртки
- `buttonClassName?`: `string` - CSS классы для кнопки
- `showPreview?`: `boolean` - показывать preview (по умолчанию: true)

---

### 3. useImageUpload (хук)
Хук для полного контроля над процессом загрузки.

```tsx
import { useImageUpload } from '../hooks/useImageUpload';

const MyComponent = () => {
  const { uploading, error, uploadSingleImage, clearError } = useImageUpload();

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
      {/* ваша кастомная UI */}
    </div>
  );
};
```

**Методы:**
- `uploadSingleImage(file: File): Promise<string | null>` - загрузить одно изображение
- `uploadMultipleImages(files: File[]): Promise<string[] | null>` - загрузить несколько изображений
- `uploadAvatarImage(file: File): Promise<string | null>` - загрузить аватар
- `clearError(): void` - очистить ошибку

**Состояние:**
- `uploading: boolean` - идёт ли загрузка
- `error: string | null` - текст ошибки

---

## API методы

### uploadImage(file: File): Promise<string>
Загружает одно изображение

### uploadImages(files: File[]): Promise<string[]>
Загружает несколько изображений

### uploadAvatar(file: File): Promise<string>
Загружает аватар

---

## Примеры использования

### Пример 1: Простая загрузка в блоке
```tsx
import ImageUploadButton from './components/ImageUploadButton';

const MyBlock = () => {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <div>
      <ImageUploadButton
        onUploadComplete={setImageUrl}
        currentImage={imageUrl}
      />
      {imageUrl && <img src={imageUrl} alt="Uploaded" />}
    </div>
  );
};
```

### Пример 2: Множественная загрузка
```tsx
import ImageUploader from './components/ImageUploader';

const Gallery = () => {
  const [images, setImages] = useState<string[]>([]);

  const handleUpload = (urls: string | string[]) => {
    if (Array.isArray(urls)) {
      setImages(prev => [...prev, ...urls]);
    }
  };

  return (
    <div>
      <ImageUploader
        onUploadComplete={handleUpload}
        multiple={true}
        maxFiles={5}
        buttonText="Добавить фото в галерею"
      />
      <div className="grid grid-cols-3 gap-4">
        {images.map((url, i) => (
          <img key={i} src={url} alt={`Image ${i}`} />
        ))}
      </div>
    </div>
  );
};
```

### Пример 3: Кастомный загрузчик с хуком
```tsx
import { useImageUpload } from '../hooks/useImageUpload';

const CustomUploader = () => {
  const { uploading, error, uploadSingleImage } = useImageUpload();
  const [imageUrl, setImageUrl] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadSingleImage(file);
      if (url) setImageUrl(url);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} disabled={uploading} />
      {uploading && <p>Загрузка...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {imageUrl && <img src={imageUrl} alt="Uploaded" />}
    </div>
  );
};
```

---

## Ограничения

- **Форматы**: JPEG, PNG, GIF, WEBP
- **Максимальный размер**: 10MB на файл
- **Максимум файлов**: до 10 за один раз (при множественной загрузке)

---

## Backend API Endpoints

- `POST /upload/image` - загрузить одно изображение
- `POST /upload/images` - загрузить несколько изображений
- `POST /upload/avatar` - загрузить аватар

Все endpoints требуют JWT авторизации.

