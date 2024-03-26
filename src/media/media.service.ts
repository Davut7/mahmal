import { Injectable, NotFoundException } from '@nestjs/common';
import { MediaEntity } from './entities/media.entity';
import { In, QueryRunner, Repository } from 'typeorm';
import { ITransformedFile } from 'src/helpers/common/interfaces/ITransformedFile.interface';
import { MinioService } from '../minio/minio.service';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaEntity)
    private mediaRepository: Repository<MediaEntity>,
    private minioService: MinioService,
    private rabbitmqService: RabbitmqService,
  ) {}

  async createFilesMedia(
    files: ITransformedFile[],
    postId: string,
    queryRunner: QueryRunner,
  ) {
    const fileIds: string[] = [];
    for (const file of files) {
      const media = new MediaEntity();
      media.originalName = file.originalName;
      media.fileName = file.fileName;
      media.filePath = file.filePath;
      media.mimeType = file.mimeType;
      media.mediaType = file.mediaType;
      media.postId = postId;
      await queryRunner.manager.save(MediaEntity, media);
      this.rabbitmqService.addToImageQueue(media.id, media.fileName);
      fileIds.push(media.id);
    }

    return { message: 'Media uploaded successfully', fileIds };
  }

  async createFileMedia(
    file: ITransformedFile,
    queryRunner: QueryRunner,
    postId: string,
  ) {
    const media = new MediaEntity();
    media.originalName = file.originalName;
    media.fileName = file.fileName;
    media.filePath = file.filePath;
    media.mimeType = file.mimeType;
    media.mediaType = file.mediaType;
    media.postId = postId;
    await queryRunner.manager.save(MediaEntity, media);
    if (file.mediaType === 'IMAGE') {
      this.rabbitmqService.addToImageQueue(media.id, media.fileName);
      return { mediaId: media.id };
    }
    this.rabbitmqService.addToVideoQueue(media.id, media.fileName);
    return { mediaId: media.id };
  }

  async deleteMedias(fileIds: string[], queryRunner: QueryRunner) {
    const files = await queryRunner.manager.find(MediaEntity, {
      where: { id: In(fileIds) },
    });
    if (!files) throw new NotFoundException('Some files are not found!');
    const fileNames = files.map((file) => file.fileName);
    await this.minioService.deleteFiles(fileNames);
    await queryRunner.manager.delete(MediaEntity, { id: In(fileIds) });
  }

  async deleteOneMedia(mediaId: string, queryRunner: QueryRunner) {
    const file = await queryRunner.manager.findOne(MediaEntity, {
      where: { id: mediaId },
    });
    if (!file) throw new NotFoundException('Some files are not found!');
    await this.minioService.deleteFile(file.fileName);
    await queryRunner.manager.delete(MediaEntity, { id: mediaId });
  }

  async createUserAvatar(
    image: ITransformedFile,
    userId: string,
    queryRunner: QueryRunner,
  ) {
    const media = new MediaEntity();
    media.originalName = image.originalName;
    media.fileName = image.fileName;
    media.filePath = image.filePath;
    media.mimeType = image.mimeType;
    media.mediaType = image.mediaType;
    media.userId = userId;
    await queryRunner.manager.save(MediaEntity, media);
    return media;
  }

  async getOneMedia(mediaId: string) {
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
    });
    if (!media) throw new NotFoundException('Media not found!');
    return media;
  }
}
