import { PickType } from '@nestjs/swagger';
import { NotificationsEntity } from '../entities/notification.entity';

export class CreateNotificationsDto extends PickType(NotificationsEntity, [
  'message',
  'status',
  'actionUserId',
  'targetUserId',
] as const) {}
