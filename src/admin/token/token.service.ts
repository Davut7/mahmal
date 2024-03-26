import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { IGenerateTokens } from 'src/helpers/common/interfaces/IGenerateTokens';
import { AdminTokenDto } from './dto/token.dto';
import { AdminTokenEntity } from './entities/token.entity';

@Injectable()
export class AdminTokenService {
  constructor(
    @InjectRepository(AdminTokenEntity)
    private tokenRepository: Repository<AdminTokenEntity>,
  ) {}

  generateTokens(payload: AdminTokenDto): IGenerateTokens {
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '30d',
    });
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '10m',
    });
    return { refreshToken, accessToken };
  }

  async saveTokens(userId: string, refreshToken: string) {
    let token;
    const user = await this.tokenRepository.findOne({ where: { userId } });
    if (user) {
      user.refreshToken = refreshToken;
      token = await this.tokenRepository.save(user);
    } else {
      token = this.tokenRepository.create({ userId, refreshToken });
      token = await this.tokenRepository.save(token);
    }
    return token;
  }

  async findToken(refreshToken: string) {
    const token = await this.tokenRepository.findOne({
      where: { refreshToken },
    });
    if (!token) throw new NotFoundException('Token not found!');
    return token;
  }

  async deleteToken(refreshToken: string) {
    await this.findToken(refreshToken);
    await this.tokenRepository.delete({ refreshToken });
    return { message: 'Token deleted successfully!' };
  }

  verifyRefreshToken(refreshToken: string) {
    try {
      return jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET,
      ) as AdminTokenDto;
    } catch (err) {
      throw new UnauthorizedException('Token not valid');
    }
  }

  verifyAccessToken(accessToken: string) {
    try {
      return jwt.verify(
        accessToken,
        process.env.JWT_ACCESS_SECRET,
      ) as AdminTokenDto;
    } catch (err) {
      throw new UnauthorizedException('Token not valid');
    }
  }
}
