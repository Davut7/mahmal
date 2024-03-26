import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToOne } from 'typeorm';
import {
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AdminRoleEnums } from 'src/helpers/constants/admin';
import { BaseEntity } from 'src/helpers/entities/abstract.entity';
import { AdminTokenEntity } from 'src/admin/token/entities/token.entity';

@Entity('admins')
export class AdminEntity extends BaseEntity {
  @ApiProperty({
    description: 'First name of the user',
    minLength: 1,
    maxLength: 50,
    required: false,
    example: 'David',
    type: String,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Column({ type: 'varchar', nullable: false })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    minLength: 1,
    maxLength: 50,
    required: false,
    example: 'David',
    type: String,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Column({ type: 'varchar', nullable: false })
  lastName: string;

  @ApiProperty({
    minLength: 8,
    description:
      'Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one symbol.',
    example: 'Test1234!',
    type: String,
  })
  @IsStrongPassword({
    minLength: 8,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @Column()
  password: string;

  @Column({ type: 'enum', enum: AdminRoleEnums, nullable: false })
  role: AdminRoleEnums;

  @OneToOne(() => AdminTokenEntity, (token) => token.user)
  token?: AdminTokenEntity;
}
