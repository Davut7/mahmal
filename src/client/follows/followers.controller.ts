import {
  BadRequestException,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FollowersService } from './followers.service';
import { CurrentUser } from 'src/helpers/common/decorators/currentUser.decorator';
import { TokenDto } from '../token/dto/token.dto';
import { ClientAuthGuard } from 'src/guards/clientAuth.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FollowersEntity } from './entities/followers.entity';

@ApiTags('followers')
@Controller('users')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  @ApiCreatedResponse({ description: 'User followed successfully' })
  @ApiConflictResponse({
    description: 'You already follow this user',
    type: ConflictException,
  })
  @ApiBadRequestResponse({
    type: BadRequestException,
    description: 'You cannot follow yourself',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'User not found',
  })
  @ApiBearerAuth()
  @Post(':id/follow')
  @UseGuards(ClientAuthGuard)
  async followUser(
    @Param('id', ParseUUIDPipe) followId: string,
    @CurrentUser() currentUser: TokenDto,
  ) {
    return await this.followersService.followUser(currentUser, followId);
  }

  @ApiOkResponse({ description: 'User unfollowed successfully' })
  @ApiBadRequestResponse({
    type: BadRequestException,
    description: 'User not followed',
  })
  @ApiBearerAuth()
  @Delete(':id/unfollow')
  @UseGuards(ClientAuthGuard)
  async unFollowUser(
    @Param('id', ParseUUIDPipe) followId: string,
    @CurrentUser() currentUser: TokenDto,
  ) {
    return await this.followersService.unFollowUser(currentUser, followId);
  }

  @ApiOkResponse({
    description: 'User followers returned successfully',
    type: [FollowersEntity],
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: NotFoundException,
  })
  @ApiBearerAuth()
  @Get(':id/followers')
  async getFollowersOfUser(@Param('id', ParseUUIDPipe) accountId: string) {
    return await this.followersService.getFollowersOfUser(accountId);
  }

  @ApiOkResponse({
    description: 'Users followed by returned successfully',
    type: [FollowersEntity],
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: NotFoundException,
  })
  @ApiBearerAuth()
  @Get(':id/following')
  async getUsersFollowedBy(@Param('id', ParseUUIDPipe) accountId: string) {
    return await this.followersService.getUsersFollowedBy(accountId);
  }
}
