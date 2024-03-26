import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/posts.entity';
import { MediaModule } from 'src/media/media.module';
import { ClientSharedModule } from 'src/shared/clientShared.module';
import { CategoryModule } from 'src/category/category.module';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity]),
    MediaModule,
    ClientSharedModule,
    CategoryModule,
    MinioModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
