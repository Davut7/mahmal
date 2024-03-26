import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { TokenDto } from '../token/dto/token.dto';
import { UpdateUserDto } from './dto/userUpdate.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { CurrentUser } from '../../helpers/common/decorators/currentUser.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { imageFilter } from 'src/helpers/filters/imageFilter';
import { ITransformedFile } from 'src/helpers/common/interfaces/ITransformedFile.interface';
import { SkipThrottle } from '@nestjs/throttler';
import { ImageTransformer } from 'src/helpers/pipes/imageTransform.pipe';
import { ClientAuthGuard } from 'src/guards/clientAuth.guard';

@ApiTags('users')
@SkipThrottle()
@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({
    description: 'User avatar uploaded successfully!',
    type: UserEntity,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConsumes()
  @UseGuards(ClientAuthGuard)
  @Post('/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './temp',
        filename: (req, file, cb) => {
          const uniqueFileName = uuidv4() + `-${file.originalname}`;

          cb(null, uniqueFileName);
        },
      }),
      fileFilter: imageFilter,
      limits: { fileSize: 1024 * 1024 * 15 },
    }),
  )
  async uploadAvatar(
    @UploadedFile(ImageTransformer) image: ITransformedFile,
    @CurrentUser() currentUser: TokenDto,
  ) {
    return await this.userService.updateUserAvatar(image, currentUser);
  }
  @ApiOkResponse({
    type: UserEntity,
    description: 'Current user returned successfully',
    status: 200,
  })
  @ApiNotFoundResponse({ description: 'User not found!', status: 404 })
  @ApiBearerAuth()
  @Get('get-me')
  @UseGuards(ClientAuthGuard)
  async getMe(@CurrentUser() currentUser: TokenDto) {
    return await this.userService.getMe(currentUser);
  }

  @ApiOkResponse({
    type: UserEntity,
    description: 'User found by id and updated',
    status: 201,
  })
  @ApiBody({ type: UpdateUserDto, description: 'User update body' })
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Patch()
  async updateUser(
    @CurrentUser() currentUser: TokenDto,
    @Body() dto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(currentUser, dto);
  }

  @ApiOkResponse({
    type: UserEntity,
    description: 'User found by id and deleted',
    status: 200,
  })
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete()
  async deleteUser(@CurrentUser() currentUser: TokenDto, @Req() req) {
    const refreshToken = req.cookies['refreshToken'];
    return await this.userService.deleteUser(currentUser, refreshToken);
  }
}
