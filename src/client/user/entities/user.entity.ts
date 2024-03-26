import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GenderEnum } from '../../../helpers/constants/user/enums/genderEnum.enum';
import { IsDateStringValid } from '../../../helpers/common/validators/IsDateValid';
import { CityEnum } from '../../../helpers/constants/user/enums/cityEnum.enum';
import { TokenEntity } from '../../token/entities/token.entity';
import { MediaEntity } from '../../../media/entities/media.entity';
import { NotificationsEntity } from '../../../notifications/entities/notification.entity';
import { PostEntity } from '../../../posts/entities/posts.entity';
import { LikesEntity } from '../../../likes/entities/likes.entity';
import { FollowersEntity } from '../../follows/entities/followers.entity';
import {
  IsBoolean,
  IsEnum,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SavedPostsEntity } from 'src/client/savedPosts/entities/savedPosts.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nickname of the user', required: false })
  @Column({ type: 'varchar', nullable: true })
  nickName?: string;

  @ApiProperty({
    description: 'First name of the user',
    minLength: 1,
    maxLength: 50,
    required: false,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Column({ type: 'varchar', nullable: true })
  firstName?: string;

  @ApiProperty({ description: 'Bio of the user', required: false })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Column({ type: 'varchar', nullable: true, length: 100 })
  bio?: string;

  @ApiProperty({ description: 'Phone number of the user', required: true })
  @IsPhoneNumber('TM')
  @Column({ type: 'varchar', nullable: false })
  phoneNumber!: string;

  @ApiProperty({ description: 'Birth date of the user', required: false })
  @IsString()
  @IsDateStringValid({
    message: 'Invalid date. Date format should be dd.mm.yyyy',
  })
  @Column({ type: 'date', nullable: true })
  birthDate?: Date;

  @ApiProperty({
    description: 'Gender of the user',
    enum: GenderEnum,
    required: false,
  })
  @IsEnum(GenderEnum)
  @Column({ type: 'enum', enum: GenderEnum, nullable: true })
  gender?: GenderEnum;

  @ApiProperty({
    description: 'City of the user',
    enum: CityEnum,
    required: false,
  })
  @IsEnum(CityEnum)
  @Column({ type: 'enum', enum: CityEnum, nullable: true })
  city?: CityEnum;

  @ApiProperty({
    description: 'Verification code of the user',
    required: false,
  })
  @IsString()
  @Column({ type: 'varchar', nullable: true })
  verificationCode?: string;

  @ApiProperty({
    description: 'Verification code expiration time',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  verifyExpireTime?: Date;

  @ApiProperty({
    description: 'Verification status of the user',
    required: false,
  })
  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  isVerified?: boolean;

  @ApiProperty({ description: 'Ban status of the user', required: false })
  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  isBanned?: boolean;

  @ApiProperty({ description: 'Ban reason of the user', required: false })
  @IsString()
  @Column({ type: 'varchar', nullable: true })
  banReason?: string;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
  })
  createdAt?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  updatedAt?: Date;

  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  deletedAt?: Date;

  @OneToOne(() => TokenEntity, (token) => token.user)
  token?: TokenEntity;

  @OneToMany(() => PostEntity, (post) => post.user)
  posts: PostEntity[];

  @OneToOne(() => MediaEntity, (media) => media.user)
  avatar: MediaEntity;

  @OneToMany(() => NotificationsEntity, (notification) => notification.user)
  notifications: NotificationsEntity[];

  @OneToMany(() => LikesEntity, (likes) => likes.user)
  postLikes: UserEntity[];

  @OneToMany(() => FollowersEntity, (follow) => follow.followingUser)
  followers: FollowersEntity[];

  @OneToMany(() => FollowersEntity, (follow) => follow.followedUser)
  follows: FollowersEntity[];

  @OneToMany(() => SavedPostsEntity, (savedPost) => savedPost.user)
  savedPosts: SavedPostsEntity[];
}
