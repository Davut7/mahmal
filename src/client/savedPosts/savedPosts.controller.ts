import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/helpers/common/decorators/currentUser.decorator';
import { TokenDto } from '../token/dto/token.dto';
import { ClientAuthGuard } from 'src/guards/clientAuth.guard';
import { SavedPostsQuery } from './dto/savedPosts';
import { SavedPostsService } from './savedPosts.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SavedPostsEntity } from './entities/savedPosts.entity';
@ApiTags('saved-posts')
@Controller('/posts')
export class SavedPostsController {
  constructor(private readonly savedPostsService: SavedPostsService) {}

  @ApiCreatedResponse({
    type: SavedPostsEntity,
    description: 'Post saved successfully',
  })
  @ApiBadRequestResponse({
    type: BadRequestException,
    description: 'This post not saveable',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Post not found',
  })
  @ApiBearerAuth()
  @Post(':postId/save')
  @UseGuards(ClientAuthGuard)
  async savePost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @CurrentUser() currentUser: TokenDto,
  ) {
    return await this.savedPostsService.savePost(currentUser, postId);
  }

  @ApiOkResponse({ description: 'Post unsaved' })
  @ApiNotFoundResponse({ description: 'Saved post not found' })
  @ApiBearerAuth()
  @Delete(':postId/unsave')
  @UseGuards(ClientAuthGuard)
  async unsavePost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @CurrentUser() currentUser: TokenDto,
  ) {
    return await this.savedPostsService.unSavePost(currentUser, postId);
  }

  @ApiOkResponse({
    type: [SavedPostsEntity],
    description: 'Saved posts retrieved successfully',
  })
  @ApiBearerAuth()
  @Get('saved')
  @UseGuards(ClientAuthGuard)
  async getSavedPosts(
    @CurrentUser() currentUser: TokenDto,
    @Query() query: SavedPostsQuery,
  ) {
    return await this.savedPostsService.getSavedPosts(currentUser, query);
  }
}
