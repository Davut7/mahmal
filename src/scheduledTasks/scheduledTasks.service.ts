import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PostsService } from 'src/posts/posts.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class ScheduledTaskService {
  constructor(
    private readonly redisService: RedisService,
    private readonly postsService: PostsService,
  ) {}

  @Cron(CronExpression.EVERY_3_HOURS)
  async handleCron() {
    const postIds = await this.postsService.getAllPostIds();
    for (const postId of postIds) {
      const viewCount = await this.redisService.getViewCount(postId);
      await this.postsService.updateViesCount(postId, viewCount);
      await this.redisService.resetViewCount(postId);
    }
  }
}
