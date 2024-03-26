import { Module } from '@nestjs/common';
import { ScheduledTaskService } from './scheduledTasks.service';
import { RedisModule } from 'src/redis/redis.module';
import { PostsModule } from 'src/posts/posts.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot(), RedisModule, PostsModule],
  providers: [ScheduledTaskService],
  exports: [ScheduledTaskService],
})
export class ScheduledTasksModule {}
