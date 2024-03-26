import { Module } from '@nestjs/common';
import { TokenModule } from 'src/client/token/token.module';
import { UserModule } from 'src/client/user/user.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  providers: [],
  imports: [TokenModule, UserModule, RedisModule],
  exports: [TokenModule, UserModule, RedisModule],
})
export class ClientSharedModule {}
