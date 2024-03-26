import {
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
  Controller,
  Patch,
  Param,
  Body,
  Delete,
  Post,
  UploadedFiles,
  Get,
  Query,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { ClientAuthGuard } from 'src/guards/clientAuth.guard';
import { CreatePostDto } from './dto/createPost.dto';
import { GetUsersPosts } from './dto/getUsersPosts';
import { UpdatePostDto } from './dto/updatePost.dto';
import { PostsService } from './posts.service';
import { ITransformedFile } from 'src/helpers/common/interfaces/ITransformedFile.interface';
import { imageFilter } from 'src/helpers/filters/imageFilter';
import { videoFilter } from 'src/helpers/filters/videoFilter';
import { ImageTransformer } from 'src/helpers/pipes/imageTransform.pipe';
import { VideoConverter } from 'src/helpers/pipes/videoTransform.pipe';
import { ImagesTransformer } from '../helpers/pipes/imagesTransform.pipe';
import { CurrentUser } from '../helpers/common/decorators/currentUser.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { TokenDto } from 'src/client/token/dto/token.dto';
import { GetPostsQuery } from './dto/getPosts';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PostEntity } from './entities/posts.entity';
import { MediaEntity } from 'src/media/entities/media.entity';

@SkipThrottle()
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOkResponse({
    description: 'Posts returned successfully',
    type: [PostEntity],
  })
  @Get()
  async getPosts(@Query() query: GetPostsQuery) {
    return await this.postsService.getPosts(query);
  }

  @ApiOkResponse({ description: 'Post media downloaded successfully' })
  @ApiBadRequestResponse({ description: 'Post is not saveable' })
  @Get(':id/download/:mediaId')
  async downloadMedia(
    @Param('id', ParseUUIDPipe) postId: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @Res() res,
  ) {
    const media = await this.postsService.downLoadPost(postId, mediaId);
    res.redirect(media);
  }

  @ApiOkResponse({
    description: 'Post returned successfully',
    type: PostEntity,
  })
  @ApiBadRequestResponse({ description: 'Post is not found' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id')
  async getOnePost(@Param('id', ParseUUIDPipe) postId: string) {
    return await this.postsService.getOnePost(postId);
  }

  @ApiOkResponse({ description: 'Post updated successfully', type: PostEntity })
  @ApiBearerAuth()
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Post not found',
  })
  @UseGuards(ClientAuthGuard)
  @Patch(':id')
  async updatePost(
    @Param('id', ParseUUIDPipe) postId: string,
    @Body() dto: UpdatePostDto,
  ) {
    return await this.postsService.updatePost(dto, postId);
  }

  @ApiOkResponse({ description: 'Post deleted successfully', type: String })
  @UseGuards(ClientAuthGuard)
  @Delete(':id')
  async deletePost(@Param('id', ParseUUIDPipe) postId: string) {
    return await this.postsService.deletePost(postId);
  }

  @ApiConsumes()
  @ApiOkResponse({
    description: 'Post images uploaded successfully',
    type: [MediaEntity],
  })
  @ApiInternalServerErrorResponse({
    description: 'Error while uploading images',
  })
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/images/:id')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './temp',
        filename: (req, file, cb) => {
          const uniqueFileName = uuidv4() + `_uploaded_${file.originalname}`;
          cb(null, uniqueFileName);
        },
      }),
      fileFilter: imageFilter,
      limits: { fileSize: 1024 * 1024 * 15 },
    }),
  )
  async createImagesPost(
    @Body() dto: CreatePostDto,
    @CurrentUser() currentUser: TokenDto,
    @UploadedFiles(ImagesTransformer) files: ITransformedFile[],
    @Param('id', ParseUUIDPipe) categoryId: string,
  ) {
    return this.postsService.createFilesPost(
      dto,
      currentUser.id,
      files,
      categoryId,
    );
  }

  @ApiConsumes()
  @ApiOkResponse({
    description: 'Post image uploaded successfully',
    type: MediaEntity,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error while uploading image',
  })
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/image/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './temp',
        filename: (req, file, cb) => {
          const uniqueFileName = uuidv4() + `_uploaded_${file.originalname}`;
          cb(null, uniqueFileName);
        },
      }),
      fileFilter: imageFilter,
      limits: { fileSize: 1024 * 1024 * 15 },
    }),
  )
  async createImagePost(
    @Body() dto: CreatePostDto,
    @CurrentUser() currentUser: TokenDto,
    @UploadedFile(ImageTransformer) file: ITransformedFile,
    @Param('id', ParseUUIDPipe) categoryId: string,
  ) {
    return this.createOneFilePost(dto, currentUser, file, categoryId);
  }

  @ApiConsumes()
  @ApiOkResponse({
    description: 'Post video uploaded successfully',
    type: MediaEntity,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error while uploading video',
  })
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/video/:id')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: './temp',
        filename: (req, file, cb) => {
          const uniqueFileName = uuidv4() + `_uploaded_${file.originalname}`;
          cb(null, uniqueFileName);
        },
      }),
      fileFilter: videoFilter,
      limits: { fileSize: 1024 * 1024 * 200 },
    }),
  )
  async createVideoPost(
    @Body() dto: CreatePostDto,
    @CurrentUser() currentUser: TokenDto,
    @UploadedFile(VideoConverter) file: ITransformedFile,
    @Param('id', ParseUUIDPipe) categoryId: string,
  ) {
    return this.createOneFilePost(dto, currentUser, file, categoryId);
  }

  private async createOneFilePost(
    dto: CreatePostDto,
    currentUser: TokenDto,
    files: ITransformedFile,
    categoryId: string,
  ) {
    return await this.postsService.createOneFilePost(
      dto,
      currentUser.id,
      files,
      categoryId,
    );
  }

  @ApiOkResponse({
    description: 'User posts returned successfully',
    type: [PostEntity],
  })
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/user/:id')
  async getUsersPosts(
    @Param('id', ParseUUIDPipe) userId: string,
    @Query() query: GetUsersPosts,
  ) {
    return await this.postsService.getUserPosts(userId, query);
  }
}
