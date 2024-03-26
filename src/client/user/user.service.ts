import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { TokenDto } from '../token/dto/token.dto';
import { UpdateUserDto } from './dto/userUpdate.dto';
import { AuthService } from '../auth/auth.service';
import { GeneratorProvider } from 'src/helpers/providers';
import { ITransformedFile } from 'src/helpers/common/interfaces/ITransformedFile.interface';
import { MediaService } from 'src/media/media.service';
import { TokenService } from '../token/token.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private mediaService: MediaService,
    private dataSource: DataSource,
    private tokenService: TokenService,
  ) {}

  async getMe(currentUser: TokenDto) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.avatar', 'avatar')
      .loadRelationCountAndMap('user.followsCount', 'user.follows')
      .loadRelationCountAndMap('user.followersCount', 'user.followers')
      .loadRelationCountAndMap('user.postsCount', 'user.posts')
      .where('user.id = :userId', { userId: currentUser.id })
      .getOne();
    if (!user) throw new BadRequestException('Current user not found!');
    return user;
  }

  async getUserById(userId: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.avatar', 'avatar')
      .loadRelationCountAndMap('user.followsCount', 'user.follows')
      .loadRelationCountAndMap('user.followersCount', 'user.followers')
      .loadRelationCountAndMap('user.postsCount', 'user.posts')
      .where('user.id = :userId', { userId: userId })
      .getOne();
    if (!user) {
      throw new NotFoundException(`User not found!`);
    }

    return user;
  }

  async updateUser(CurrentUser: TokenDto, dto: UpdateUserDto) {
    const user = await this.getUserById(CurrentUser.id);
    this.isUserCanUpdate(user.updatedAt);
    if (user.nickName === null) {
      let nickName = GeneratorProvider.generateReadableNickName(
        dto.firstName.toLowerCase(),
      );
      let isUnique = false;
      while (!isUnique) {
        const existingUser = await this.userRepository.findOne({
          where: { nickName },
        });
        user.nickName = nickName;
        isUnique = !existingUser;
      }
    }
    Object.assign(user, dto);
    user.updatedAt = new Date(Date.now());
    user.isVerified = false;
    await this.userRepository.save(user);

    return {
      message: 'User updated successfully',
      user,
    };
  }

  async deleteUser(currentUser: TokenDto, refreshToken: string) {
    const user = await this.getUserById(currentUser.id);

    const token = await this.tokenService.findToken(refreshToken);
    user.isVerified = false;
    await this.userRepository.save(user);
    await this.tokenService.deleteToken(refreshToken);

    await this.userRepository.softDelete(user.id);

    return {
      message: 'User deleted successfully',
    };
  }

  async isUserCanUpdate(updatedAt: Date) {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    if (updatedAt > twoWeeksAgo) {
      const timeDiff = updatedAt.getTime() - twoWeeksAgo.getTime();
      const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hoursRemaining = Math.floor(
        (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutesRemaining = Math.floor(
        (timeDiff % (1000 * 60 * 60)) / (1000 * 60),
      );

      throw new BadRequestException(
        `You can only update your profile every 14 days. Time remaining until next update: ${daysRemaining} days, ${hoursRemaining} hours, and ${minutesRemaining} minutes.`,
      );
    }
  }

  async updateUserAvatar(image: ITransformedFile, currentUser: TokenDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await this.getMe(currentUser);
      await this.isUserCanUpdate(user.updatedAt);
      if (user.avatar !== null) {
        await this.mediaService.deleteOneMedia(user.avatar.id, queryRunner);
      }
      await this.mediaService.createUserAvatar(image, user.id, queryRunner);
      await queryRunner.commitTransaction();
      return { message: 'User avatar uploaded successfully!' };
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Error while uploading  user avatar' + ' ' + err.message,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
