import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { MinioService } from '../../minio/minio.service';
import { unlink } from 'fs/promises';
import { createReadStream } from 'fs';
import { ITransformedFile } from '../common/interfaces/ITransformedFile.interface';
import { MediaType } from '../constants/media';

@Injectable()
export class VideoConverter implements PipeTransform<Express.Multer.File> {
  constructor(private readonly minioService: MinioService) {}

  async transform(file: Express.Multer.File): Promise<ITransformedFile> {
    if (!file) {
      throw new BadRequestException('Invalid file upload');
    }
    try {
      const uploadStream = createReadStream(file.path);

      await this.minioService.uploadFileStream(
        file.filename,
        uploadStream,
        file.mimetype,
      );
      return {
        fileName: file.filename,
        filePath: await this.minioService.getFileUrl(file.filename),
        originalName: file.originalname,
        mimeType: file.mimetype,
        mediaType: MediaType.VIDEO,
      };
    } catch (error) {
      console.error('Error during video conversion:', error);
      throw error;
    } finally {
      await unlink(file.path);
    }
  }
}
