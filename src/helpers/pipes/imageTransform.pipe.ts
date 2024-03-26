import {
  Injectable,
  InternalServerErrorException,
  PipeTransform,
} from '@nestjs/common';
import { ITransformedFile } from '../common/interfaces/ITransformedFile.interface';
import { MinioService } from '../../minio/minio.service';
import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';
import { MediaType } from '../constants/media';

@Injectable()
export class ImageTransformer implements PipeTransform<Express.Multer.File> {
  constructor(private readonly minioService: MinioService) {}

  async transform(file: Express.Multer.File): Promise<ITransformedFile> {
    const uploadStream = createReadStream(file.path);
    await this.minioService.uploadFileStream(
      file.filename,
      uploadStream,
      file.mimetype,
    );

    await unlink(file.path);

    return {
      fileName: file.filename,
      filePath: await this.minioService.getFileUrl(file.filename),
      mimeType: file.mimetype,
      originalName: file.originalname,
      mediaType: MediaType.IMAGE,
    };
  }
  catch(err) {
    console.error(`Error processing file :`, err);
    throw new InternalServerErrorException(
      'Failed to process some files. Please check server logs for details.',
    );
  }
}
