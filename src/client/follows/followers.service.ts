import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FollowersEntity } from './entities/followers.entity';
import { Repository } from 'typeorm';
import { TokenDto } from '../token/dto/token.dto';
import { UserService } from '../user/user.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class FollowersService {
  constructor(
    @InjectRepository(FollowersEntity)
    private followRepository: Repository<FollowersEntity>,
    private userService: UserService,
    private notificationService: NotificationsService,
  ) {}

  async followUser(currentUser: TokenDto, followsId: string) {
    await this.userService.getUserById(followsId);
    if (currentUser.id === followsId)
      throw new BadRequestException('You can not follow yourself');
    await this.notificationService.createNotification({
      actionUserId: currentUser.id,
      targetUserId: followsId,
      message: `${currentUser.nickName} started following you`,
    });
    const follow = await this.followRepository.findOne({
      where: {
        followedUser: { id: followsId },
        followingUser: { id: currentUser.id },
      },
    });
    if (follow) throw new ConflictException('You already followed this user');
    const subscribe = this.followRepository.create({
      followedUser: { id: followsId },
      followingUser: { id: currentUser.id },
    });

    await this.followRepository.save(subscribe);

    return {
      message: 'Subscribed successfully',
    };
  }

  async unFollowUser(currentUser: TokenDto, followsId: string) {
    const follow = await this.isUserFollowing(currentUser, followsId);
    await this.followRepository.delete(follow.id);
    return {
      message: 'Unfollowed successfully',
    };
  }

  async isUserFollowing(currentUser: TokenDto, followsId: string) {
    const follow = await this.followRepository.findOne({
      where: {
        followingUser: { id: currentUser.id },
        followedUser: { id: followsId },
      },
    });
    if (!follow) throw new NotFoundException('User not followed');
    return follow;
  }

  async getFollowersOfUser(accountId: string) {
    await this.userService.getUserById(accountId);
    const [followers, count] = await this.followRepository
      .createQueryBuilder('follows')
      .leftJoinAndSelect('follows.followingUser', 'followingUser')
      .where('follows.id = :id', { id: accountId })
      .getManyAndCount();

    return {
      message: 'User followers returned successfully',
      followers: followers,
      followersCount: count,
    };
  }

  async getUsersFollowedBy(accountId: string) {
    await this.userService.getUserById(accountId);
    const [following, count] = await this.followRepository
      .createQueryBuilder('follows')
      .leftJoinAndSelect('follows.followedUser', 'followedUser')
      .where('follows.followingUser = :followingUser', {
        followingUser: accountId,
      })
      .getManyAndCount();

    return {
      message: 'Accounts followed by user returned successfully',
      following: following,
      followingCount: count,
    };
  }
}
