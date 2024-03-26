import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminTokenService } from 'src/admin/token/token.service';
import { ROLES_KEY } from 'src/helpers/common/decorators/requiredRole.decorator';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private tokenService: AdminTokenService,
    private reflector: Reflector,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedException('User unauthorized');
      }
      const [bearer, token] = authHeader.split(' ');
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException('User unauthorized');
      }

      const userToken = this.tokenService.verifyAccessToken(token);

      req.currentUser = userToken;

      const hasRole = requiredRoles.includes(userToken.role);
      if (!hasRole) {
        throw new UnauthorizedException('Permission Denied');
      }
      const isInBlackList = await this.redisService.getAccessToken(
        token,
        token,
      );
      if (isInBlackList) throw new UnauthorizedException('Invalid token');

      return true;
    } catch (error) {
      throw new UnauthorizedException('User unauthorized');
    }
  }
}
