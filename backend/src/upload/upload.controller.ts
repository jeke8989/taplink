import {
  Controller,
  Post,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeleteFileDto } from './dto/delete-file.dto';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Загрузить один файл
   * POST /upload/image
   */
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не предоставлен');
    }

    const url = await this.uploadService.uploadFile(file, 'images');
    return {
      success: true,
      url,
      message: 'Файл успешно загружен',
    };
  }

  /**
   * Загрузить несколько файлов
   * POST /upload/images
   */
  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 10)) // максимум 10 файлов
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Файлы не предоставлены');
    }

    const urls = await this.uploadService.uploadFiles(files, 'images');
    return {
      success: true,
      urls,
      message: `Загружено ${urls.length} файлов`,
    };
  }

  /**
   * Загрузить аватар
   * POST /upload/avatar
   */
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не предоставлен');
    }

    const url = await this.uploadService.uploadFile(file, 'avatars');
    return {
      success: true,
      url,
      message: 'Аватар успешно загружен',
    };
  }

  /**
   * Удалить файл из S3
   * DELETE /upload/delete
   */
  @Delete('delete')
  async deleteFile(@Body() deleteFileDto: DeleteFileDto) {
    await this.uploadService.deleteFile(deleteFileDto.url);
    return {
      success: true,
      message: 'Файл успешно удален',
    };
  }
}

