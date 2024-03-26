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
export class ImagesTransformer implements PipeTransform<Express.Multer.File[]> {
  constructor(private readonly minioService: MinioService) {}

  async transform(files: Express.Multer.File[]): Promise<ITransformedFile[]> {
    const transformedFiles: ITransformedFile[] = [];
    for (const file of files) {
      try {
        const uploadStream = createReadStream(file.path);

        await this.minioService.uploadFileStream(
          file.filename,
          uploadStream,
          file.mimetype,
        );

        transformedFiles.push({
          fileName: file.filename,
          originalName: file.originalname,
          filePath: await this.minioService.getFileUrl(file.filename),
          mimeType: file.mimetype,
          mediaType: MediaType.IMAGE,
        });
        await unlink(file.path);
      } catch (err) {
        console.error(`Error processing file ${file.originalname}:`, err);
        await unlink(file.path);
        throw new InternalServerErrorException(
          'Failed to process some files. Please check server logs for details.',
        );
      }
    }

    return transformedFiles;
  }
}
