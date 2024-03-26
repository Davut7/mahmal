import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenEntity } from './entities/token.entity';
import { Repository } from 'typeorm';
import { TokenDto } from './dto/token.dto';
import * as jwt from 'jsonwebtoken';
import { IGenerateTokens } from 'src/helpers/common/interfaces/IGenerateTokens';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(TokenEntity)
    private tokenRepository: Repository<TokenEntity>,
  ) {}

  generateTokens(payload: TokenDto): IGenerateTokens {
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '30d',
    });
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '15h',
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
      ) as TokenDto;
    } catch (err) {
      throw new UnauthorizedException('Token not valid');
    }
  }

  verifyAccessToken(accessToken: string) {
    try {
      return jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET) as TokenDto;
    } catch (err) {
      throw new UnauthorizedException('Token not valid');
    }
  }
}
