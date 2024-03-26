import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './entities/posts.entity';
import { Repository, DataSource } from 'typeorm';
import { CreatePostDto } from './dto/createPost.dto';
import { MediaService } from 'src/media/media.service';
import { ITransformedFile } from 'src/helpers/common/interfaces/ITransformedFile.interface';
import { UpdatePostDto } from './dto/updatePost.dto';
import { GetUsersPosts } from './dto/getUsersPosts';
import {
  GetPostsOrderBy,
  OrderType,
  UserLngEnum,
  UserPostsOrderBy,
} from 'src/helpers/constants';
import { CategoryService } from 'src/category/category.service';
import { VisibilityStateEnum } from 'src/helpers/constants/posts/visibility.enum';
import { RedisService } from 'src/redis/redis.service';
import { GetPostsQuery } from './dto/getPosts';
import { MediaStatusEnum } from 'src/helpers/constants/media';
import { MinioService } from 'src/minio/minio.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
    private mediaService: MediaService,
    private dataSource: DataSource,
    private categoryService: CategoryService,
    private redisService: RedisService,
    private minioService: MinioService,
  ) {}

  async createFilesPost(
    dto: CreatePostDto,
    userId: string,
    files: ITransformedFile[],
    categoryId: string,
  ) {
    await this.userCanPost(userId, files);
    const queryRunner = this.dataSource.createQueryRunner();
    let uploadedFileIds: string[];
    await queryRunner.connect();
    await queryRunner.startTransaction();
    await this.categoryService.findCategoryById(categoryId);
    try {
      const post = this.postRepository.create({
        ...dto,
        userId,
        category: { id: categoryId },
      });

      await this.postRepository.save(post);
      const mediaEntity = await this.mediaService.createFilesMedia(
        files,
        post.id,
        queryRunner,
      );
      uploadedFileIds = mediaEntity.fileIds;
      await queryRunner.commitTransaction();

      return {
        message: 'Post created successfully',
        post: post,
      };
    } catch (err: any) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      if (uploadedFileIds.length > 0) {
        try {
          await this.mediaService.deleteMedias(uploadedFileIds, queryRunner);
        } catch (deleteError) {
          console.error(
            'Failed to delete uploaded files after transaction rollback:',
            deleteError,
          );
        }
      }
      throw new InternalServerErrorException(err);
    } finally {
      await queryRunner.release();
    }
  }

  async createOneFilePost(
    dto: CreatePostDto,
    userId: string,
    file: ITransformedFile,
    categoryId: string,
  ) {
    let mediaId: string;
    await this.userCanPost(userId, file);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    await this.categoryService.findCategoryById(categoryId);
    try {
      const post = this.postRepository.create({
        ...dto,
        userId,
        category: { id: categoryId },
      });

      await this.postRepository.save(post);
      const mediaEntity = await this.mediaService.createFileMedia(
        file,
        queryRunner,
        post.id,
      );
      mediaId = mediaEntity.mediaId;
      await queryRunner.commitTransaction();

      return {
        message: 'Post created successfully',
        post: post,
      };
    } catch (err: any) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      if (!mediaId) {
        try {
          await this.mediaService.deleteOneMedia(mediaId, queryRunner);
        } catch (deleteError) {
          console.error(
            'Failed to delete uploaded files after transaction rollback:',
            deleteError,
          );
        }
      }
      throw new InternalServerErrorException(err);
    } finally {
      await queryRunner.release();
    }
  }

  async userCanPost(
    userId: string,
    files: ITransformedFile[] | ITransformedFile,
  ) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const [post, postCount] = await this.postRepository
      .createQueryBuilder('post')
      .where('post.userId = :userId', { userId })
      .andWhere('post.createdAt BETWEEN :weekAgo AND :now', { weekAgo, now })
      .getManyAndCount();

    if (postCount >= 5) {
      const timeDiff = post[4]?.createdAt?.getTime() - weekAgo.getTime();
      const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hoursRemaining = Math.floor(
        (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutesRemaining = Math.floor(
        (timeDiff % (1000 * 60 * 60)) / (1000 * 60),
      );
      if (Array.isArray(files)) {
        for (const file of files) {
          await this.minioService.deleteFile(file.fileName);
        }
      } else if (typeof files?.fileName === 'string') {
        await this.minioService.deleteFile(files.fileName);
      } else {
        throw new BadRequestException(
          'Invalid "files" type. Must be an array of ITransformedFile or a single ITransformedFile object.',
        );
      }

      throw new BadRequestException(
        `You can create 5 posts every week. Time remaining until next update: ${daysRemaining} days, ${hoursRemaining} hours, and ${minutesRemaining} minutes.`,
      );
    }
  }

  async findOnePost(postId: string): Promise<PostEntity> {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.medias', 'medias')
      .where('post.id = :postId', { postId })
      .getOne();
    if (!post) throw new NotFoundException('Post not found!');
    return post;
  }

  async deletePost(postId: string) {
    const post = await this.findOnePost(postId);
    let mediaIds: string[] = [];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const media of post.medias) {
        mediaIds.push(media.id);
      }
      await this.mediaService.deleteMedias(mediaIds, queryRunner);
      await queryRunner.manager.delete(PostEntity, { id: postId });
      await queryRunner.commitTransaction();
      return {
        message: 'Post deleted successfully',
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Error while deleting post: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updatePost(dto: UpdatePostDto, postId: string) {
    const post = await this.findOnePost(postId);
    Object.assign(post, dto);
    await this.postRepository.save(post);
    return {
      message: 'Post updated successfully!',
    };
  }

  async getUserPosts(userId: string, query?: GetUsersPosts) {
    const {
      take = 10,
      page = 1,
      orderBy = UserPostsOrderBy.createdAt,
      order = OrderType.DESC,
    } = query;

    const [posts, count] = await this.postRepository
      .createQueryBuilder('posts')
      .leftJoinAndSelect('posts.medias', 'medias')
      .loadRelationCountAndMap('posts.likeCount', 'posts.likes')
      .where('posts.userId = :userId', { userId: userId })
      .take(take)
      .take((page - 1) * take)
      .orderBy(`posts.${orderBy}`, order)
      .getManyAndCount();

    return {
      message: 'User posts returned successfully',
      posts: posts,
      postCount: count,
    };
  }

  async getAllPostIds() {
    const posts = await this.postRepository.find({ select: ['id'] });
    return posts.map((post) => post.id);
  }

  async getPosts(query?: GetPostsQuery) {
    const {
      order = OrderType.DESC,
      orderBy = GetPostsOrderBy.createdAt,
      take = 5,
      page = 1,
      lng = UserLngEnum.tkm,
      q = '',
    } = query;

    const postQuery = this.postRepository
      .createQueryBuilder('posts')
      .leftJoinAndSelect('posts.medias', 'medias')
      .leftJoinAndSelect('posts.category', 'category')
      .loadRelationCountAndMap('posts.likesCount', 'posts.userLikes')
      .where(
        'posts.visibility = :visibility AND posts.isVerified = :isVerified AND medias.status = :status',
        {
          visibility: VisibilityStateEnum.PUBLIC,
          isVerified: true,
          status: MediaStatusEnum.TRANSCODED,
        },
      )
      .select([
        'posts.description',
        'posts.isSavable',
        'posts.visibility',
        'posts.isVerified',
        'posts.viewsCount',
        'posts.userId',
        'posts.id',
        'posts.createdAt',
        'medias.id',
        'medias.fileName',
        'medias.originalName',
        'medias.filePath',
        'medias.status',
        'medias.mediaType',
        'medias.mimeType',
        'category.id',
        `category.${lng}Title`,
      ]);

    if (query.city || query.category) {
      postQuery.andWhere(
        'posts.city = :city OR posts.categoryId = :categoryId',
        { city: query.city, categoryId: query.category },
      );
    }

    const post = await postQuery
      .andWhere('posts.description ILIKE :q', { q: `%${q}%` })
      .take(take)
      .skip((page - 1) * take)
      .orderBy(`posts.${orderBy}`, order)
      .getMany();

    return post;
  }

  async getOnePost(postId: string) {
    const post = await this.postRepository
      .createQueryBuilder('posts')
      .leftJoinAndSelect('posts.medias', 'medias')
      .where('posts.id = :postId', { postId })
      .select([
        'posts.description',
        'posts.isSavable',
        'posts.visibility',
        'posts.isVerified',
        'posts.viewsCount',
        'posts.userId',
        'posts.id',
        'posts.createdAt',
        'medias.id',
        'medias.fileName',
        'medias.originalName',
        'medias.filePath',
        'medias.status',
        'medias.mediaType',
        'medias.mimeType',
      ])
      .getOne();

    if (!post.isVerified) throw new BadRequestException('Post is not verified');
    if (post.visibility !== VisibilityStateEnum.PUBLIC)
      throw new BadRequestException('Post is not public');
    await this.redisService.incrementViewCount(postId);
    return post;
  }

  async updateViesCount(postId: string, viewsCount: number) {
    const post = await this.findOnePost(postId);
    post.viewsCount += viewsCount;

    await this.postRepository.save(post);
  }

  async downLoadPost(postId: string, mediaId: string) {
    const post = await this.findOnePost(postId);
    await this.mediaService.getOneMedia(mediaId);
    if (!post.isSavable)
      throw new BadRequestException('This post not saveable');
    const downloadMedia = post.medias.find((media) => media.id === mediaId);
    return downloadMedia.filePath;
  }
}
