import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserEntity } from 'src/client/user/entities/user.entity';
import { NotificationStatusEnum } from 'src/helpers/constants';
import { BaseEntity } from 'src/helpers/entities/abstract.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'notifications' })
export class NotificationsEntity extends BaseEntity {
  @ApiProperty({
    description: 'Notification message',
    required: true,
    type: String,
    example: 'You have new subscriber',
  })
  @IsNotEmpty()
  @IsString()
  @Column()
  message: string;

  @ApiProperty({
    description: 'Notification view status',
    required: true,
    type: Boolean,
    example: true,
  })
  @Column({
    type: 'boolean',
    default: false,
  })
  isViewed: boolean;

  @ApiProperty({
    description: 'Notification status enum',
    required: true,
    type: NotificationStatusEnum,
    enum: NotificationStatusEnum,
    example: 'success',
  })
  @IsEnum(NotificationStatusEnum)
  @IsNotEmpty()
  @Column({
    type: 'enum',
    enum: NotificationStatusEnum,
    default: NotificationStatusEnum.success,
  })
  status?: NotificationStatusEnum;

  @Column({ type: 'uuid', nullable: false })
  targetUserId: string;

  @Column({ type: 'uuid', nullable: false })
  actionUserId: string;

  @ManyToOne(() => UserEntity, (user) => user.notifications)
  user: UserEntity;
}
