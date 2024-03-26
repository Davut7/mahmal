import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Sse,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationsDto } from './dto/createNotifications.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { ClientAuthGuard } from 'src/guards/clientAuth.guard';
import { CurrentUser } from 'src/helpers/common/decorators/currentUser.decorator';
import { TokenDto } from 'src/client/token/dto/token.dto';

@SkipThrottle()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  //FIXME: TimeoutInterceptor
  // @UseInterceptors(TimeoutInterceptor)
  @UseGuards(ClientAuthGuard)
  @Sse('subscribe')
  subscribeNotifications(@CurrentUser() currentUser: TokenDto) {
    return this.notificationsService.subscribeNotifications(currentUser.id);
  }

  @Post(':id')
  async sendNotifications(@Body() dto: CreateNotificationsDto) {
    return await this.notificationsService.createNotification(dto);
  }
}
