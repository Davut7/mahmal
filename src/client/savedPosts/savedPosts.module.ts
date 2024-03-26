import { Module } from '@nestjs/common';
import { SavedPostsService } from './savedPosts.service';
import { SavedPostsController } from './savedPosts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedPostsEntity } from './entities/savedPosts.entity';
import { PostsModule } from 'src/posts/posts.module';
import { ClientSharedModule } from 'src/shared/clientShared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SavedPostsEntity]),
    PostsModule,
    ClientSharedModule,
  ],
  controllers: [SavedPostsController],
  providers: [SavedPostsService],
})
export class SavedPostsModule {}
