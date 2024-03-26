import { UserEntity } from 'src/client/user/entities/user.entity';
import { BaseEntity } from 'src/helpers/entities/abstract.entity';
import { Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'followers' })
export class FollowersEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.followers, {
    onDelete: 'CASCADE',
  })
  followingUser: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.follows, { onDelete: 'CASCADE' })
  followedUser: UserEntity;
}
