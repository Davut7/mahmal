import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

const tenMinutesInSeconds = 60 * 10;

@Injectable()
export class RedisService {
  private readonly redisClient: Redis;

  constructor() {
    this.redisClient = new Redis();
  }

  async incrementViewCount(postId: string): Promise<void> {
    await this.redisClient.incr(`post:${postId}:views`);
  }

  async getViewCount(postId: string): Promise<number> {
    const views = await this.redisClient.get(`post:${postId}:views`);
    return views ? parseInt(views) : 0;
  }

  async resetViewCount(postId: string): Promise<void> {
    await this.redisClient.del(`post:${postId}:views`);
  }

  async setAccessTokenWithExpiry(
    prefix: string,
    key: string,
    value: string,
  ): Promise<void> {
    await this.redisClient.set(
      `${prefix}:${key}`,
      value,
      'EX',
      tenMinutesInSeconds,
    );
  }

  async getAccessToken(prefix: string, key: string): Promise<string | null> {
    return this.redisClient.get(`${prefix}:${key}`);
  }
}
