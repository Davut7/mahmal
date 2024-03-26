import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/helpers/entities/abstract.entity';
import { PostEntity } from 'src/posts/entities/posts.entity';
import { UserEntity } from 'src/client/user/entities/user.entity';
import { MediaStatusEnum, MediaType } from 'src/helpers/constants/media';

@Entity({ name: 'medias' })
export class MediaEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 2000, nullable: false })
  originalName: string;

  @Column({ type: 'varchar', length: 2000, nullable: false })
  fileName: string;

  @Column({ type: 'varchar', length: 2000, nullable: false })
  filePath: string;

  @Column({ type: 'varchar', nullable: false })
  mimeType: string;

  @Column({ type: 'uuid', nullable: true })
  postId: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'enum', enum: MediaStatusEnum, default: 'UPLOADED' })
  status: MediaStatusEnum;

  @Column({ type: 'enum', enum: MediaType, nullable: false })
  mediaType: MediaType;

  @OneToOne(() => UserEntity, (user) => user.avatar)
  @JoinColumn()
  user: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.medias, { onDelete: 'CASCADE' })
  post: PostEntity;
}
