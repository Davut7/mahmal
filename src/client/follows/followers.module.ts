import { Module } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { FollowersController } from './followers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowersEntity } from './entities/followers.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ClientSharedModule } from 'src/shared/clientShared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FollowersEntity]),
    ClientSharedModule,
    NotificationsModule,
  ],
  controllers: [FollowersController],
  providers: [FollowersService],
})
export class FollowersModule {}
