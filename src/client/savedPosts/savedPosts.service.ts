import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedPostsEntity } from './entities/savedPosts.entity';
import { TokenDto } from '../token/dto/token.dto';
import { PostsService } from 'src/posts/posts.service';
import { SavedPostsQuery } from './dto/savedPosts';
import { OrderType, SavedPostsOrderBy } from 'src/helpers/constants';

@Injectable()
export class SavedPostsService {
  constructor(
    @InjectRepository(SavedPostsEntity)
    private savedPostsRepository: Repository<SavedPostsEntity>,
    private postService: PostsService,
  ) {}

  async savePost(currentUser: TokenDto, postId: string) {
    await this.isPostSaved(currentUser, postId);
    const post = await this.postService.findOnePost(postId);
    if (!post.isSavable) throw new BadRequestException('Post not saveable');
    const savedPost = this.savedPostsRepository.create({
      post: { id: postId },
      user: { id: currentUser.id },
    });
    await this.savedPostsRepository.save(savedPost);
    return {
      message: 'Post saved successfully',
    };
  }

  async unSavePost(currentUser: TokenDto, postId: string) {
    const savedPost = await this.getOneSavedPost(currentUser, postId);
    await this.savedPostsRepository.delete(savedPost.id);
    return {
      message: 'Post unsaved successfully',
    };
  }

  async getSavedPosts(currentUser: TokenDto, query?: SavedPostsQuery) {
    const {
      take = 10,
      page = 1,
      orderBy = SavedPostsOrderBy.createdAt,
      order = OrderType.DESC,
    } = query;

    const [savedPosts, count] = await this.savedPostsRepository
      .createQueryBuilder('savedPosts')
      .leftJoinAndSelect('savedPosts.post', 'post')
      .where('savedPosts.user = :userId', { userId: currentUser.id })
      .take(take)
      .skip((page - 1) * take)
      .orderBy(`savedPosts.${orderBy}`, order)
      .getManyAndCount();

    return {
      message: 'Saved posts returned successfully',
      savedPosts: savedPosts,
      savePostsCount: count,
    };
  }

  async isPostSaved(currentUser: TokenDto, postId: string) {
    const post = await this.savedPostsRepository.findOne({
      where: { user: { id: currentUser.id }, post: { id: postId } },
    });
    if (post) throw new ConflictException('You already saved this post');
  }

  async getOneSavedPost(currentUser: TokenDto, postId: string) {
    const post = await this.savedPostsRepository.findOne({
      where: { user: { id: currentUser.id }, post: { id: postId } },
    });
    if (!post) throw new NotFoundException('Post not saved');
    return post;
  }
}
