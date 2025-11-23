import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('S3_BUCKET');
    
    this.s3Client = new S3Client({
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      region: this.configService.get<string>('S3_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('S3_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: this.configService.get<boolean>('S3_FORCE_PATH_STYLE') || true,
    });
  }

  /**
   * Загрузить файл в S3 хранилище
   * @param file - файл для загрузки
   * @param folder - папка в bucket (опционально)
   * @returns URL загруженного файла
   */
  async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<string> {
    if (!file) {
      throw new BadRequestException('Файл не предоставлен');
    }

    // Валидация типа файла (только изображения)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Разрешены только изображения (JPEG, PNG, GIF, WEBP)');
    }

    // Валидация размера файла (макс 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('Размер файла не должен превышать 10MB');
    }

    try {
      // Генерируем уникальное имя файла
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

      // Загружаем файл в S3
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Делаем файл публично доступным
      });

      await this.s3Client.send(command);

      // Возвращаем публичный URL
      const s3Endpoint = this.configService.get<string>('S3_ENDPOINT');
      return `${s3Endpoint}/${this.bucketName}/${fileName}`;
    } catch (error) {
      console.error('Ошибка загрузки в S3:', error);
      throw new BadRequestException('Ошибка загрузки файла');
    }
  }

  /**
   * Загрузить несколько файлов
   * @param files - массив файлов для загрузки
   * @param folder - папка в bucket (опционально)
   * @returns массив URL загруженных файлов
   */
  async uploadFiles(files: Express.Multer.File[], folder: string = 'uploads'): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Файлы не предоставлены');
    }

    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Удалить файл из S3 хранилища
   * @param url - полный URL файла
   * @returns true если файл удален
   */
  async deleteFile(url: string): Promise<boolean> {
    if (!url) {
      throw new BadRequestException('URL файла не предоставлен');
    }

    try {
      // Извлекаем ключ файла из URL
      // Формат URL: https://s3.twcstorage.ru/bucket-name/folder/filename.ext
      const s3Endpoint = this.configService.get<string>('S3_ENDPOINT');
      const urlWithoutEndpoint = url.replace(`${s3Endpoint}/${this.bucketName}/`, '');
      
      if (!urlWithoutEndpoint || urlWithoutEndpoint === url) {
        throw new BadRequestException('Некорректный URL файла');
      }

      // Удаляем файл из S3
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: urlWithoutEndpoint,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      console.error('Ошибка удаления из S3:', error);
      throw new BadRequestException('Ошибка удаления файла');
    }
  }
}

