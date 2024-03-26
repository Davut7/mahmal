import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserLoginDto } from './dto/userLogin.dto';
import { AdminAuthService } from './auth.service';
import { SkipThrottle } from '@nestjs/throttler';
import { LoginResponse } from './types';
import { AdminAuthGuard } from 'src/guards/adminAuth.guard';

@ApiTags('admin-auth')
@SkipThrottle()
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  @ApiBody({
    type: UserLoginDto,
    description: 'Data to login',
  })
  @ApiOkResponse({
    type: LoginResponse,
    description: 'User logged in',
  })
  @ApiNotFoundResponse({ status: 404, description: 'User not found' })
  @Post('login')
  async login(@Body() userLoginDto: UserLoginDto, @Res() res) {
    const user = await this.authService.userLogin(userLoginDto);
    res.cookie('refreshToken', user.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(200).json({
      user: user.user,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    });
  }

  @ApiOkResponse({ type: LoginResponse, description: 'User tokens refreshed' })
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
  @UseGuards(AdminAuthGuard)
  @Post('logout')
  async logout(@Req() req, @Res() res) {
    const refreshToken = req.cookies['refreshToken'];
    await this.authService.userLogout(refreshToken);
    res.clearCookie('refreshToken');
    res.status(200).json({
      message: 'Logged out successfully!',
    });
  }
}
