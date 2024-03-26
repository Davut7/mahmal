import { RedisService } from 'src/redis/redis.service';
import { TokenService } from '../client/token/token.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ClientAuthGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) throw new UnauthorizedException('User unauthorized3');
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];

      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException('User unauthorized');
      }

      const userToken = this.tokenService.verifyAccessToken(token);
      const isInBlackList = await this.redisService.getAccessToken(
        token,
        token,
      );
      if (isInBlackList) throw new UnauthorizedException('Invalid token');
      req.currentUser = userToken;
      return true;
    } catch (e) {
      throw new UnauthorizedException('User unauthorized');
    }
  }
}
