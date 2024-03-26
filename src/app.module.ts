import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { MinioService } from './minio/minio.service';
import { LogsMiddleware } from './logger/middleware/logs.middleware';
import DatabaseLogger from './logger/helpers/databaseLogger';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger/logger.module';
import { ClientSharedModule } from './shared/clientShared.module';
import { HttpExceptionFilter } from './core/allException.filter';
import { MediaModule } from './media/media.module';
import { TokenModule } from './client/token/token.module';
import { UserModule } from './client/user/user.module';
import { AuthModule } from './client/auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CategoryModule } from './category/category.module';
import { AdminUserModule } from './admin/users/user.module';
import { AdminAuthModule } from './admin/auth/auth.module';
import { LikesModule } from './likes/likes.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { FollowersModule } from './client/follows/followers.module';
import { SavedPostsModule } from './client/savedPosts/savedPosts.module';
import { ReportsModule } from './reports/reports.module';
import { RedisModule } from './redis/redis.module';
import { ScheduledTasksModule } from './scheduledTasks/scheduledTasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `.${process.env.NODE_ENV}.env` }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ['entity/**/.model.ts'],
      migrations: ['src/migrations/*.ts'],
      migrationsTableName: 'custom_migration_table',
      autoLoadEntities: true,
      synchronize: true,
      logger: new DatabaseLogger(),
    }),
    LoggerModule,
    TokenModule,
    UserModule,
    AuthModule,
    ClientSharedModule,
    MediaModule,
    PostsModule,
    NotificationsModule,
    CategoryModule,
    AdminUserModule,
    AdminAuthModule,
    LikesModule,
    RabbitmqModule,
    FollowersModule,
    SavedPostsModule,
    ReportsModule,
    RedisModule,
    ScheduledTasksModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    MinioService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes('*');
  }
}
