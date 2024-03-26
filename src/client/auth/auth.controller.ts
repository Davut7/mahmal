import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserEntity } from '../user/entities/user.entity';
import { UserRegistrationDto } from './dto/userRegistration.dto';
import { UserLoginDto } from './dto/userLogin.dto';
import { UserVerificationDto } from './dto/userVerification.dto';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { RedisService } from 'src/redis/redis.service';
import { ClientAuthGuard } from 'src/guards/clientAuth.guard';

@ApiTags('client-auth')
@SkipThrottle()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private redisService: RedisService,
  ) {}

  @ApiBody({ type: UserRegistrationDto, description: 'Data to create user' })
  @ApiCreatedResponse({ type: UserEntity, description: 'User created' })
  @ApiConflictResponse({ status: 409, description: 'User already exists' })
  @Post('registration')
  async registration(@Body() userRegistrationDto: UserRegistrationDto) {
    return await this.authService.userRegistration(userRegistrationDto);
  }
  @ApiBody({ type: UserLoginDto, description: 'Data to login' })
  @ApiCreatedResponse({ type: UserLoginDto, description: 'User logged in' })
  @ApiNotFoundResponse({ status: 404, description: 'User not found' })
  @SkipThrottle({ default: false })
  @Throttle({ default: { ttl: 60 * 60 * 1000, limit: 5 } })
  @Post('login')
  async login(@Body() userLoginDto: UserLoginDto, @Res() res) {
    const user = await this.authService.userLogin(userLoginDto);
    res.status(200).json({
      message: `Verification code sent to number ${userLoginDto.phoneNumber} `,
      userId: user.userId,
    });
  }

  @ApiOkResponse({ description: 'User verified' })
  @ApiNotFoundResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User id' })
  @Post('verify/:id')
  async verifyAccount(
    @Res() res,
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() dto: UserVerificationDto,
  ) {
    const user = await this.authService.verifyAccount(userId, dto);
    res.cookie('refreshToken', user.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(200).json({
      message: 'User tokens refreshed successfully!',
      user: user.user,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    });
  }

  @ApiOkResponse({ type: UserEntity, description: 'User tokens refreshed' })
  @ApiUnauthorizedResponse({ status: 401, description: 'User unauthorized' })
  @Get('refresh')
  async refresh(@Req() req, @Res() res) {
    const refreshToken = req.cookies['refreshToken'];
    const user = await this.authService.userRefresh(refreshToken);
    res.cookie('refreshToken', user.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(200).json({
      message: 'User tokens refreshed successfully!',
      user: user.user,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    });
  }

  @ApiOkResponse({ description: 'User logged out' })
  @ApiUnauthorizedResponse({ status: 401, description: 'User unauthorized' })
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('logout')
  async logout(@Req() req, @Res() res) {
    const refreshToken = req.cookies['refreshToken'];
    const accessToken = req.headers.authorization.split(' ')[1];
    await this.redisService.setAccessTokenWithExpiry(
      'accessToken',
      accessToken,
      accessToken,
    );
    await this.authService.userLogout(refreshToken);
    res.clearCookie('refreshToken');
    res.status(200).json({
      message: 'Logged out successfully!',
    });
  }

  @SkipThrottle({ default: false })
  @Throttle({ default: { ttl: 2 * 60 * 1000, limit: 1 } })
  @Post('/resend-verification')
  async resendVerificationCode(@Body() dto: UserLoginDto) {
    return this.authService.sentVerificationCode(dto);
  }
}
