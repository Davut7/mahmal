import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { CurrentUser } from 'src/helpers/common/decorators/currentUser.decorator';
import { TokenDto } from 'src/client/token/dto/token.dto';
import { GetLikedPosts } from './dto/getLikedPosts.query';
import { ClientAuthGuard } from 'src/guards/clientAuth.guard';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { LikesEntity } from './entities/likes.entity';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @ApiOkResponse({
    type: LikesEntity,
    description: 'Post returned successfully',
  })
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get()
  async getLikedPosts(
    @CurrentUser() currentUser: TokenDto,
    @Query() query: GetLikedPosts,
  ) {
    return await this.likesService.getLikedPosts(currentUser, query);
  }

  @ApiOkResponse({ type: LikesEntity, description: 'Post liked successfully' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Post not found',
  })
  @UseGuards(ClientAuthGuard)
  @Post(':id')
  async likePost(
    @CurrentUser() currentUser: TokenDto,
    @Param('id') postId: string,
  ) {
    return await this.likesService.likePost(currentUser, postId);
  }

  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Post not liked',
  })
  @ApiOkResponse({ description: 'Post unliked' })
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('id')
  async unLikePost(
    @CurrentUser() currentUser: TokenDto,
    @Param('id') postId: string,
  ) {
    return await this.likesService.unLikePost(currentUser, postId);
  }
}
