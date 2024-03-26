import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserEntity } from 'src/client/user/entities/user.entity';

export class UserVerificationDto extends PickType(UserEntity, [
  'verificationCode',
] as const) {
  @IsNotEmpty()
  @IsString()
  verificationCode: string;
}
