import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaEntity } from './entities/media.entity';
import { MinioModule } from 'src/minio/minio.module';
import { ImageTransformer } from 'src/helpers/pipes/imageTransform.pipe';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MediaEntity]),
    MinioModule,
    RabbitmqModule,
  ],
  providers: [MediaService, ImageTransformer],
  exports: [MediaService, ImageTransformer],
})
export class MediaModule {}
