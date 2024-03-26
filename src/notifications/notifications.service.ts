import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateNotificationsDto } from './dto/createNotifications.dto';
import { fromEvent } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationsEntity } from './entities/notification.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class NotificationsService {
  private eventEmitter: EventEmitter2;
  constructor(
    @InjectRepository(NotificationsEntity)
    private readonly notificationsRepository: Repository<NotificationsEntity>,
  ) {
    this.eventEmitter = new EventEmitter2();
  }

  async findNotificationsForUserId(
    targetUserId: string,
  ): Promise<NotificationsEntity[]> {
    return await this.notificationsRepository.find({
      where: { targetUserId: targetUserId },
      order: { createdAt: 'DESC' },
    });
  }

  async createNotification(
    dto: CreateNotificationsDto,
  ): Promise<NotificationsEntity> {
    const notification = this.notificationsRepository.create({
      ...dto,
    });
    await this.notificationsRepository.save(notification);
    const notificationsData = JSON.stringify({
      message: dto.message,
      id: notification.id,
      isViewed: false,
    });
    this.eventEmitter.emit(
      `notifications:${dto.targetUserId}`,
      notificationsData,
    );

    return notification;
  }

  async subscribeNotifications(targetUserId: string) {
    return fromEvent(this.eventEmitter, `notifications:${targetUserId}`);
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await this.notificationsRepository.update(notificationId, {
      isViewed: true,
    });
  }
}
