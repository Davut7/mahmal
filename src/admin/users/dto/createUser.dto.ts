import { PickType } from '@nestjs/swagger';
import { AdminEntity } from 'src/admin/users/entities/adminUsers.entity';

export class CreateUserDto extends PickType(AdminEntity, [
  'firstName',
  'lastName',
  'role',
  'password',
] as const) {}
