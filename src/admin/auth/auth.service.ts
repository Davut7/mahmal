import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminTokenDto } from '../token/dto/token.dto';
import { AdminEntity } from '../users/entities/adminUsers.entity';
import { UserLoginDto } from './dto/userLogin.dto';
import { AdminTokenService } from '../token/token.service';
import { compare } from 'bcryptjs';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(AdminEntity)
    private adminRepository: Repository<AdminEntity>,
    private tokenService: AdminTokenService,
  ) {}

  async userLogin(dto: UserLoginDto) {
    const user = await this.adminRepository.findOne({
      where: { firstName: dto.firstName },
    });

    if (!user) throw new NotFoundException('User not found!');
    const isPasswordCorrect = await compare(dto.password, user.password);
    if (!isPasswordCorrect || !user)
      throw new BadRequestException('Invalid user data');
    const tokens = this.tokenService.generateTokens({
      ...new AdminTokenDto(user),
    });
    await this.tokenService.saveTokens(user.id, tokens.refreshToken);
    return {
      message: 'User logged in successfully',
      user: user,
      ...tokens,
    };
  }

  async userRefresh(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('User unauthorized');
    const isValidToken = this.tokenService.verifyRefreshToken(refreshToken);
    const tokenFromDb = await this.tokenService.findToken(refreshToken);
    if (!isValidToken || !tokenFromDb)
      throw new UnauthorizedException('User unauthorized');
    const user = await this.getUserById(tokenFromDb.userId);
    const tokens = this.tokenService.generateTokens({
      ...new AdminTokenDto(user),
    });
    await this.tokenService.saveTokens(user.id, tokens.refreshToken);
    return {
      message: 'User verified successfully',
      user: user,
      ...tokens,
    };
  }

  async userLogout(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('User unauthorized');
    const token = await this.tokenService.findToken(refreshToken);
    await this.getUserById(token.userId);
    await this.tokenService.deleteToken(refreshToken);
    return {
      message: 'Logged out successfully',
    };
  }

  async getUserById(userId: string) {
    const user = await this.adminRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
