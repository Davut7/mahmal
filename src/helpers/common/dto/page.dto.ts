import {
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  IsString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderType } from '../../constants/order';
import { UserLngEnum } from 'src/helpers/constants';

export class PageOptionsDto {
  @IsEnum(OrderType)
  @IsOptional()
  @Type(() => String)
  readonly order: OrderType = OrderType.ASC;

  @ApiProperty({
    title: 'Query to pagination, current page',
    name: 'page',
    description: 'Need to pagination, current page',
    default: 1,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  readonly page?: number;

  @ApiProperty({
    title: 'Query to take records',
    name: 'take',
    description: 'Need to pagination, take records',
    default: 10,
    required: false,
    enum: [5, 10, 20, 50],
  })
  @IsInt()
  @Min(1)
  @IsIn([5, 10, 20, 50])
  @IsOptional()
  @Type(() => Number)
  readonly take?: number;

  @ApiProperty({
    title: 'Query to search',
    name: 'q',
    description: 'Query to search',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly q?: string;

  @ApiProperty({
    title: 'Query to search',
    name: 'q',
    description: 'Query to search',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserLngEnum)
  readonly lng: UserLngEnum;
}
