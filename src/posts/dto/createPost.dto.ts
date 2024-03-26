import { OmitType } from '@nestjs/swagger';
import { PostEntity } from '../entities/posts.entity';

export class CreatePostDto extends OmitType(PostEntity, [
  'createdAt',
  'deletedAt',
  'id',
  'updatedAt',
  'user',
] as const) {}
