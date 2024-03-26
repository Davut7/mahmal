import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminTokenService } from './token.service';
import { AdminTokenEntity } from './entities/token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminTokenEntity])],
  providers: [AdminTokenService],
  exports: [AdminTokenService],
})
export class AdminTokenModule {}
