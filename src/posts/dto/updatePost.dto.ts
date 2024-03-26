import { PickType } from '@nestjs/swagger';
import { PostEntity } from '../entities/posts.entity';

export class UpdatePostDto extends PickType(PostEntity, [
  'isVerified',
] as const) {}
