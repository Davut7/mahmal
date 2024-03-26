import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';
import { GetPostsOrderBy } from 'src/helpers/constants';
import { CityEnum } from 'src/helpers/constants/user/enums/cityEnum.enum';

export class GetPostsQuery extends PageOptionsDto {
  @IsOptional()
  @IsEnum(GetPostsOrderBy)
  orderBy: GetPostsOrderBy;

  @IsOptional()
  @IsEnum(CityEnum)
  city: CityEnum;

  @IsOptional()
  @IsString()
  category: string;
}
