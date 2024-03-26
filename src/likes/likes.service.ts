import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikesEntity } from './entities/likes.entity';
import { TokenDto } from 'src/client/token/dto/token.dto';
import { GetLikedPosts } from './dto/getLikedPosts.query';
import { likedPostsOrderBy, OrderType } from 'src/helpers/constants';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PostsService } from 'src/posts/posts.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(LikesEntity)
    private likesRepository: Repository<LikesEntity>,
    private notificationsService: NotificationsService,
    private postService: PostsService,
  ) {}

  async likePost(currentUser: TokenDto, postId: string) {
    const post = await this.postService.findOnePost(postId);
    await this.isLiked(currentUser, postId);
    await this.notificationsService.createNotification({
      actionUserId: currentUser.id,
      message: `User with name ${currentUser.nickName} liked your post`,
      targetUserId: post.userId,
    });
    const likedPost = this.likesRepository.create({
      userId: currentUser.id,
      postId: postId,
    });
    await this.likesRepository.save(likedPost);
    return {
      message: 'Post liked successfully',
    };
  }

  async unLikePost(currentUser: TokenDto, postId: string) {
    await this.likesRepository.delete({
      userId: currentUser.id,
      postId: postId,
    });
    return {
      message: 'Post unliked successfully',
    };
  }

  async getLikedPosts(currentUser: TokenDto, query?: GetLikedPosts) {
    const {
      take = 10,
      page = 1,
      order = OrderType.DESC,
      orderBy = likedPostsOrderBy.createdAt,
    } = query;
    const [posts, count] = await this.likesRepository
      .createQueryBuilder('likedPosts')
      .leftJoinAndSelect('likedPosts.post', 'post')
      .where('likedPosts.userId = :userId', { userId: currentUser.id })
      .take(take)
      .take((page - 1) * take)
      .orderBy(`likedPosts.${orderBy}`, order)
      .getManyAndCount();
    return {
      message: 'Liked posts returned successfully',
      posts: posts,
      postCount: count,
    };
  }

  async isLiked(currentUser: TokenDto, postId: string) {
    const likedPost = await this.likesRepository.findOne({
      where: { postId: postId, userId: currentUser.id },
    });
    if (likedPost) throw new ConflictException(`You already liked this post`);
  }
}
