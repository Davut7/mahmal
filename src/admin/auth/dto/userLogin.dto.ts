import { PickType } from '@nestjs/swagger';
import { AdminEntity } from 'src/admin/users/entities/adminUsers.entity';

export class UserLoginDto extends PickType(AdminEntity, [
  'firstName',
  'password',
] as const) {}
