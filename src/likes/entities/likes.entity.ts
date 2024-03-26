import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/client/user/entities/user.entity';
import { BaseEntity } from 'src/helpers/entities/abstract.entity';
import { PostEntity } from 'src/posts/entities/posts.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'post_likes' })
export class LikesEntity extends BaseEntity {
  @ApiProperty({ type: String, required: true, description: 'Post id' })
  @Column({ type: 'uuid', nullable: false })
  postId: string;

  @ApiProperty({ type: String, required: true, description: 'Post id' })
  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.postLikes, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.userLikes, {
    onDelete: 'CASCADE',
  })
  post: PostEntity;
}
