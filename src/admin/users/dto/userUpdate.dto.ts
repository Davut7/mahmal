import { PartialType, PickType } from '@nestjs/swagger';
import { AdminEntity } from '../entities/adminUsers.entity';

export class UpdateUserDto extends PartialType(
  PickType(AdminEntity, ['firstName', 'lastName', 'password']),
) {}
