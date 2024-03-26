import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { TokenService } from '../token/token.service';
import { UserRegistrationDto } from './dto/userRegistration.dto';
import { TokenDto } from '../token/dto/token.dto';
import { UserLoginDto } from './dto/userLogin.dto';
import { GeneratorProvider } from '../../helpers/providers/generator.provider';
import { UserVerificationDto } from './dto/userVerification.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private tokenService: TokenService,
  ) {}

  async userRegistration(dto: UserRegistrationDto) {
    const candidate = await this.userRepository.findOne({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (candidate)
      throw new ConflictException(
        `User with phone ${dto.phoneNumber} already exists. Please login`,
      );

    let verificationCode = GeneratorProvider.generateVerificationCode();
    if (process.env.NODE_ENV === 'development') {
      verificationCode = '123456';
    }
    const user = this.userRepository.create({
      phoneNumber: dto.phoneNumber,
      verificationCode: verificationCode,
      verifyExpireTime: new Date(),
    });

    await this.userRepository.save(user);

    return {
      message: `Verification code sent to number ${dto.phoneNumber} `,
      userId: user.id,
    };
  }

  async verifyAccount(userId: string, dto: UserVerificationDto) {
    const user = await this.getUserById(userId);
    if (user.verificationCode !== dto.verificationCode)
      throw new BadRequestException('Verification code wrong');
    if (Date.now() - +user.verifyExpireTime >= 10 * 60 * 1000) {
      throw new BadRequestException('Verification code expired!');
    }

    await this.userRepository.save(user);
    const tokenDto = new TokenDto(user);
    const tokens = this.tokenService.generateTokens({ ...tokenDto });
    await this.tokenService.saveTokens(user.id, tokens.refreshToken);
    return {
      message: 'User verified successfully',
      user: user,
      ...tokens,
    };
  }

  async userLogin(dto: UserLoginDto) {
    const user = await this.assignVerificationCode(dto.phoneNumber);

    return {
      message: `Verification code sent to number ${dto.phoneNumber} `,
      userId: user.id,
    };
  }

  async userRefresh(refreshToken: string) {
    if (!refreshToken)
      throw new UnauthorizedException('User refreshToken not provided');
    const isValidToken = this.tokenService.verifyRefreshToken(refreshToken);
    const tokenFromDb = await this.tokenService.findToken(refreshToken);
    if (!isValidToken || !tokenFromDb)
      throw new UnauthorizedException('User unauthorized');
    const user = await this.getUserById(tokenFromDb.userId);
    const tokenDto = new TokenDto(user);
    const tokens = this.tokenService.generateTokens({ ...tokenDto });
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
    const user = await this.getUserById(token.userId);
    user.isVerified = false;
    await this.userRepository.save(user);
    await this.tokenService.deleteToken(refreshToken);
    return {
      message: 'Logged out successfully',
    };
  }

  async sentVerificationCode(dto: UserLoginDto) {
    await this.assignVerificationCode(dto.phoneNumber);

    return {
      message: 'Verification code sent successfully!',
    };
  }

  async findUserByPhoneNumber(phoneNumber: string) {
    const user = await this.userRepository.findOne({
      where: { phoneNumber: phoneNumber },
    });

    if (!user) throw new NotFoundException(`User not found!`);

    return user;
  }

  async assignVerificationCode(phoneNumber: string) {
    const user = await this.findUserByPhoneNumber(phoneNumber);
    if (process.env.NODE_ENV === 'development') {
      user.verificationCode = '123456';
      user.verifyExpireTime = new Date();
      await this.userRepository.save(user);
      return user;
    }
    const verificationCode = GeneratorProvider.generateVerificationCode();
    user.verificationCode = verificationCode;
    user.verifyExpireTime = new Date();
    await this.userRepository.save(user);
    return user;
  }

  async getUserById(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);
    return user;
  }
}
