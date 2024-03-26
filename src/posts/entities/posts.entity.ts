import { ApiProperty } from '@nestjs/swagger';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { SavedPostsEntity } from 'src/client/savedPosts/entities/savedPosts.entity';
import { UserEntity } from 'src/client/user/entities/user.entity';
import { VisibilityStateEnum } from 'src/helpers/constants/posts/visibility.enum';
import { CityEnum } from 'src/helpers/constants/user/enums/cityEnum.enum';
import { BaseEntity } from 'src/helpers/entities/abstract.entity';
import { LikesEntity } from 'src/likes/entities/likes.entity';
import { MediaEntity } from 'src/media/entities/media.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity({ name: 'posts' })
export class PostEntity extends BaseEntity {
  @ApiProperty({
    title: 'description',
    name: 'description',
    required: true,
    type: String,
    example: 'This video about programming',
  })
  @Column({ type: 'varchar', length: 2000, nullable: false })
  description: string;

  @ApiProperty({
    title: 'isSavable',
    name: 'isSavable',
    required: true,
    type: Boolean,
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  isSavable: boolean;

  @ApiProperty({
    title: 'visibility',
    name: 'visibility',
    required: true,
    type: VisibilityStateEnum,
    example: VisibilityStateEnum.FRIENDS,
    enum: VisibilityStateEnum,
  })
  @Column({
    type: 'enum',
    enum: VisibilityStateEnum,
    default: VisibilityStateEnum.PUBLIC,
  })
  visibility: VisibilityStateEnum;

  @ApiProperty({
    title: 'isVerified',
    name: 'isVerified',
    required: true,
    type: Boolean,
    example: true,
  })
  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @ApiProperty({
    title: 'userId',
    name: 'userId',
    required: true,
    type: String,
  })
  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ApiProperty({
    title: 'viewsCount',
    name: 'viewsCount',
    required: true,
    type: Number,
  })
  @Column({ type: 'int', default: 0 })
  viewsCount: number;

  @ManyToOne(() => UserEntity, (user) => user.posts, {
    onDelete: 'NO ACTION',
  })
  user: UserEntity;

  @Column({ type: 'enum', enum: CityEnum, nullable: false })
  city: CityEnum;

  @ManyToOne(() => CategoryEntity, (category) => category.posts, {
    onDelete: 'SET NULL',
  })
  category: CategoryEntity;

  @OneToMany(() => MediaEntity, (media) => media.post)
  medias: MediaEntity[];

  @OneToMany(() => LikesEntity, (like) => like.post)
  userLikes: LikesEntity[];

  @OneToMany(() => SavedPostsEntity, (savedPost) => savedPost.post)
  savedPosts: SavedPostsEntity[];
}
