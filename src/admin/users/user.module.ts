import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserService } from './user.service';
import { AdminEntity } from './entities/adminUsers.entity';
import { AdminUsersController } from './user.controller';
import { AdminSharedModule } from 'src/shared/adminShared.module';

@Module({
  imports: [TypeOrmModule.forFeature([AdminEntity]), AdminSharedModule],
  controllers: [AdminUsersController],
  providers: [AdminUserService],
  exports: [AdminUserService],
})
export class AdminUserModule {}
