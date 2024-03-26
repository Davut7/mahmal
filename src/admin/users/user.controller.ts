import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/userUpdate.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../helpers/common/decorators/currentUser.decorator';
import { AdminUserService } from './user.service';
import { AdminTokenDto } from '../token/dto/token.dto';
import { AdminEntity } from './entities/adminUsers.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { AdminAuthGuard } from 'src/guards/adminAuth.guard';

@ApiTags('admins-users')
@SkipThrottle()
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly userService: AdminUserService) {}

  @ApiCreatedResponse({
    type: AdminEntity,
    description: 'Admin user created',
    status: 201,
  })
  @ApiConflictResponse({
    status: 409,
    description: 'Admin with this data already exists',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return await this.userService.createUser(dto);
  }

  @ApiNotFoundResponse({ description: 'User not found!', status: 404 })
  @ApiOkResponse({
    type: AdminEntity,
    description: 'Current user returned successfully',
  })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Get('get-me')
  async getMe(@CurrentUser() currentUser: AdminTokenDto) {
    console.log(currentUser);
    return await this.userService.getMe(currentUser);
  }

  @ApiOkResponse({
    type: AdminEntity,
    description: 'User found by id and updated',
    status: 201,
  })
  @ApiBody({ type: UpdateUserDto, description: 'User update body' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Admin id' })
  @UseGuards(AdminAuthGuard)
  @Patch(':id')
  async updateUser(
    @Body() dto: UpdateUserDto,
    @Param('id', ParseUUIDPipe) userId: string,
  ) {
    return await this.userService.updateUser(userId, dto);
  }

  @ApiOkResponse({
    type: AdminEntity,
    description: 'User found by id and deleted',
    status: 200,
  })
  @ApiParam({ name: 'id', description: 'Admin id' })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id', ParseUUIDPipe) userId: string) {
    return await this.userService.deleteUser(userId);
  }
}
