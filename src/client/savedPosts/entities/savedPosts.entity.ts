import { UserEntity } from 'src/client/user/entities/user.entity';
import { BaseEntity } from 'src/helpers/entities/abstract.entity';
import { PostEntity } from 'src/posts/entities/posts.entity';
import { Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'saved_posts' })
export class SavedPostsEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.savedPosts, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.savedPosts, {
    onDelete: 'CASCADE',
  })
  post: PostEntity;
}
