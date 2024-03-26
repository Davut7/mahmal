import { Module } from '@nestjs/common';
import { AdminTokenModule } from 'src/admin/token/token.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [AdminTokenModule, RedisModule],
  exports: [AdminTokenModule, RedisModule],
})
export class AdminSharedModule {}
