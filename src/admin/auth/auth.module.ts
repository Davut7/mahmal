import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from '../users/entities/adminUsers.entity';
import { AdminAuthService } from './auth.service';
import { AdminAuthController } from './auth.controller';
import { AdminSharedModule } from 'src/shared/adminShared.module';

@Module({
  imports: [TypeOrmModule.forFeature([AdminEntity]), AdminSharedModule],
  controllers: [AdminAuthController],
  providers: [AdminAuthService],
  exports: [AdminAuthService],
})
export class AdminAuthModule {}
