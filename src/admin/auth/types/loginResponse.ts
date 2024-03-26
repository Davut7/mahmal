import { ApiProperty } from '@nestjs/swagger';
import { AdminEntity } from 'src/admin/users/entities/adminUsers.entity';

export class LoginResponse {
  @ApiProperty({
    title: 'accessToken',
    type: String,
    description: 'JWT access token',
    example: process.env.JWT_TOKEN_EXAMPLE,
  })
  accessToken: string;

  @ApiProperty({
    title: 'refreshToken',
    type: String,
    description: 'JWT refresh token',
  })
  refreshToken: string;

  @ApiProperty({
    title: 'message',
    type: String,
    description: 'success message',
    example: 'User logged in successfully',
  })
  message: string;

  @ApiProperty({
    title: 'AdminEntity',
    type: String,
    description: 'Admin user',
  })
  user: AdminEntity;
}
