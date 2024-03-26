import { PickType } from '@nestjs/swagger';
import { UserEntity } from '../../user/entities/user.entity';

export class UserLoginDto extends PickType(UserEntity, [
  'phoneNumber',
] as const) {}
